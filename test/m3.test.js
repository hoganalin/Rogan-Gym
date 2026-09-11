/**
 * ============================================================
 * 里程碑 M3：升級教練 + 教練後台
 * ============================================================
 *
 * 這個檔案在驗收什麼：
 * 1. 升級教練（POST /api/admin/coaches/:userId）：一般會員可以被升級成教練，
 *    同一個人不能被升級兩次
 * 2. 教練個人資料（GET / PUT /api/admin/coaches）：只有教練本人能看與改，
 *    profile_image_url 必須是 https 開頭，skill_ids 要能存能讀
 * 3. 開課（POST /api/admin/coaches/courses）：欄位齊全才能開課、
 *    meeting_url 必須 https、一般會員不能開課
 * 4. 單一課程查詢與更新（GET / PUT /api/admin/coaches/courses/:courseId）：
 *    只有課主能查、能改自己的課（owner-scoped）
 * 5. 教練課程列表（GET /api/admin/coaches/courses）：陣列、含中文 status 與
 *    participants 欄位
 *
 * 紅燈時的三步自救：
 * 1. 看測試名稱 —— 測試名就是行為描述，先搞清楚是哪個「行為」沒過
 * 2. 對照 API 文件「教練後台（admin）」那一節 —— 確認路徑、必填欄位、回傳形狀
 * 3. 用 Postman / curl 本機重打一次同樣的請求 —— 看你的 server 實際回了什麼
 *
 * 提醒：這些測試全程只透過 HTTP 打你的 API（黑箱），需要的會員 / 教練 /
 * 技能 / 課程都是測試自己當場建立的，不依賴資料庫裡的舊資料。
 */
const {
  api,
  randName,
  expectSuccess,
  expectFailed,
  signupAndLogin,
  login,
  createSkill,
  promoteToCoach,
  makeCoach,
  futureUtc,
  createCourse,
} = require('./helpers');

describe('M3 升級教練與教練後台', () => {
  describe('升級教練 POST /api/admin/coaches/:userId', () => {
    test('把一般會員升級成教練 → 成功，且升級後重新登入就能進教練後台', async () => {
      const user = await signupAndLogin();

      const res = await promoteToCoach(user.userId);
      expectSuccess(res);

      // 行為驗證：升級真的生效 —— 重新登入拿新身分，教練後台要進得去
      const { token } = await login(user.email, user.password);
      const profileRes = await api()
        .get('/api/admin/coaches')
        .set('Authorization', `Bearer ${token}`);
      expectSuccess(profileRes);
    });

    test('對同一個人再升級一次 → 失敗（已經是教練了）', async () => {
      const user = await signupAndLogin();
      expectSuccess(await promoteToCoach(user.userId));

      const again = await promoteToCoach(user.userId);
      expectFailed(again);
    });
  });

  describe('教練個人資料 GET /api/admin/coaches', () => {
    test('教練查看自己的資料 → 回傳 experience_years / description / skill_ids', async () => {
      const coach = await makeCoach();

      const res = await api()
        .get('/api/admin/coaches')
        .set('Authorization', `Bearer ${coach.token}`);
      expectSuccess(res);
      expect(res.body.data).toHaveProperty('experience_years');
      expect(res.body.data).toHaveProperty('description');
      expect(Array.isArray(res.body.data.skill_ids)).toBe(true);
    });

    test('一般會員（不是教練）查教練資料 → 失敗', async () => {
      const member = await signupAndLogin();

      const res = await api()
        .get('/api/admin/coaches')
        .set('Authorization', `Bearer ${member.token}`);
      expectFailed(res);
    });

    test('沒帶 token 查教練資料 → 失敗，訊息為「請先登入」', async () => {
      const res = await api().get('/api/admin/coaches');
      expectFailed(res);
      expect(res.body.message).toBe('請先登入');
    });
  });

  describe('更新教練個人資料 PUT /api/admin/coaches', () => {
    test('教練更新資料（含技能清單）→ 成功，回傳的 skill_ids 包含該技能', async () => {
      const coach = await makeCoach();
      const skill = await createSkill();

      const res = await api()
        .put('/api/admin/coaches')
        .set('Authorization', `Bearer ${coach.token}`)
        .send({
          experience_years: 5,
          description: '更新後的教練自我介紹',
          profile_image_url: 'https://example.com/avatar.png',
          skill_ids: [skill.id],
        });
      expectSuccess(res);
      expect(res.body.data.skill_ids).toContain(skill.id);
      expect(Number(res.body.data.experience_years)).toBe(5);
    });

    test('profile_image_url 用 http:// 開頭 → 失敗（必須是 https 開頭）', async () => {
      const coach = await makeCoach();
      const skill = await createSkill();

      const res = await api()
        .put('/api/admin/coaches')
        .set('Authorization', `Bearer ${coach.token}`)
        .send({
          experience_years: 5,
          description: '其他欄位都合法，只有圖片網址不是 https',
          profile_image_url: 'http://example.com/avatar.png',
          skill_ids: [skill.id],
        });
      expectFailed(res);
    });
  });

  describe('開課 POST /api/admin/coaches/courses', () => {
    test('教練開新課程 → 成功，回傳課程 id', async () => {
      const coach = await makeCoach();
      const skill = await createSkill();

      // createCourse 內部已驗證成功合約（2xx + status: success）
      const course = await createCourse(coach.token, skill.id);
      expect(course.id).toBeTruthy();
    });

    test('缺必填欄位（沒給課程名稱）→ 失敗', async () => {
      const coach = await makeCoach();
      const skill = await createSkill();

      const res = await api()
        .post('/api/admin/coaches/courses')
        .set('Authorization', `Bearer ${coach.token}`)
        .send({
          skill_id: skill.id,
          description: '這筆請求少了 name 欄位',
          start_at: futureUtc(7),
          end_at: futureUtc(7, 2),
          max_participants: 10,
          meeting_url: 'https://example.com/meeting',
        });
      expectFailed(res);
    });

    test('meeting_url 不是 https 開頭 → 失敗', async () => {
      const coach = await makeCoach();
      const skill = await createSkill();

      const res = await api()
        .post('/api/admin/coaches/courses')
        .set('Authorization', `Bearer ${coach.token}`)
        .send({
          skill_id: skill.id,
          name: randName('課程'),
          description: '其他欄位都合法，只有會議連結不是 https',
          start_at: futureUtc(7),
          end_at: futureUtc(7, 2),
          max_participants: 10,
          meeting_url: 'http://example.com/meeting',
        });
      expectFailed(res);
    });

    test('一般會員（不是教練）開課 → 失敗', async () => {
      const member = await signupAndLogin();
      const skill = await createSkill();

      const res = await api()
        .post('/api/admin/coaches/courses')
        .set('Authorization', `Bearer ${member.token}`)
        .send({
          skill_id: skill.id,
          name: randName('課程'),
          description: '欄位都合法，但這個人不是教練',
          start_at: futureUtc(7),
          end_at: futureUtc(7, 2),
          max_participants: 10,
          meeting_url: 'https://example.com/meeting',
        });
      expectFailed(res);
    });
  });

  describe('單一課程查詢與更新（owner-scoped）', () => {
    test('課主用自己的 token 查單一課程 → 回扁平物件，含 name / skill_id / meeting_url', async () => {
      const coach = await makeCoach();
      const skill = await createSkill();
      const course = await createCourse(coach.token, skill.id);

      const res = await api()
        .get(`/api/admin/coaches/courses/${course.id}`)
        .set('Authorization', `Bearer ${coach.token}`);
      expectSuccess(res);
      expect(res.body.data.name).toBe(course.name);
      expect(res.body.data.skill_id).toBe(skill.id);
      expect(res.body.data.meeting_url).toBe(course.meeting_url);
    });

    test('用另一個教練的 token 查別人的課程 → 失敗（只能查自己的課）', async () => {
      const owner = await makeCoach();
      const stranger = await makeCoach();
      const skill = await createSkill();
      const course = await createCourse(owner.token, skill.id);

      const res = await api()
        .get(`/api/admin/coaches/courses/${course.id}`)
        .set('Authorization', `Bearer ${stranger.token}`);
      expectFailed(res);
    });

    test('課主更新課程（全欄位）→ 成功，再查一次能看到新內容', async () => {
      const coach = await makeCoach();
      const skill = await createSkill();
      const course = await createCourse(coach.token, skill.id);
      const newName = randName('改版課程');

      const res = await api()
        .put(`/api/admin/coaches/courses/${course.id}`)
        .set('Authorization', `Bearer ${coach.token}`)
        .send({
          skill_id: skill.id,
          name: newName,
          description: '更新後的課程介紹',
          start_at: futureUtc(14),
          end_at: futureUtc(14, 2),
          max_participants: 8,
          meeting_url: 'https://example.com/new-meeting',
        });
      expectSuccess(res);

      // 行為驗證：改完再查一次，內容真的變了
      const check = await api()
        .get(`/api/admin/coaches/courses/${course.id}`)
        .set('Authorization', `Bearer ${coach.token}`);
      expectSuccess(check);
      expect(check.body.data.name).toBe(newName);
      expect(Number(check.body.data.max_participants)).toBe(8);
    });

    test('用另一個教練的 token 更新別人的課程 → 失敗（只能改自己的課）', async () => {
      const owner = await makeCoach();
      const stranger = await makeCoach();
      const skill = await createSkill();
      const course = await createCourse(owner.token, skill.id);

      // 外人送一份「欄位都合法」的更新，唯一該擋下來的理由只有「這不是他的課」
      const res = await api()
        .put(`/api/admin/coaches/courses/${course.id}`)
        .set('Authorization', `Bearer ${stranger.token}`)
        .send({
          skill_id: skill.id,
          name: randName('被外人改的課'),
          description: '外人嘗試覆蓋別人的課程',
          start_at: futureUtc(14),
          end_at: futureUtc(14, 2),
          max_participants: 8,
          meeting_url: 'https://example.com/hijack',
        });
      expectFailed(res);

      // 行為驗證：課主再查一次，內容要維持原樣（沒有被外人蓋掉）
      const check = await api()
        .get(`/api/admin/coaches/courses/${course.id}`)
        .set('Authorization', `Bearer ${owner.token}`);
      expectSuccess(check);
      expect(check.body.data.name).toBe(course.name);
    });
  });

  describe('教練課程列表 GET /api/admin/coaches/courses', () => {
    test('列表是陣列、包含剛開的課，每堂課有中文 status 與 participants 欄位', async () => {
      const coach = await makeCoach();
      const skill = await createSkill();
      const course = await createCourse(coach.token, skill.id);

      const res = await api()
        .get('/api/admin/coaches/courses')
        .set('Authorization', `Bearer ${coach.token}`);
      expectSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);

      const mine = res.body.data.find((item) => item.id === course.id);
      expect(mine).toBeDefined();
      expect(['尚未開始', '進行中', '已結束']).toContain(mine.status);
      expect(mine).toHaveProperty('participants');
      // 剛開的課還沒有人報名（數字或數字字串皆可）
      expect(Number(mine.participants)).toBe(0);
    });
  });
});
