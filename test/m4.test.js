/**
 * ============================================================
 * M4 公開瀏覽 — 合約測試（訪客不用登入就能看的資料）
 *
 * 這個里程碑在測什麼：
 *   1. 教練列表  GET /api/coaches?per=&page=（per/page 必填）
 *   2. 教練詳情  GET /api/coaches/{coachId}
 *   3. 教練的課程 GET /api/coaches/{coachId}/courses（口徑：end_at > now 的「未結束」課程）
 *   4. 進行中課程 GET /api/courses（口徑：start_at <= now < end_at，跟上面不一樣！）
 *
 * 紅燈時的三步自救：
 *   1. 看測試名稱 — 名稱就是行為描述，先搞懂測試期望的行為是什麼
 *   2. 對照 API 文件「M4 公開瀏覽」對應端點的章節，確認回傳形狀與時間過濾口徑
 *   3. 用 Postman 或 curl 對你本機 server 重打一次同樣的請求，看實際回了什麼
 * ============================================================
 */
const crypto = require('crypto');
const {
  api,
  expectSuccess,
  expectFailed,
  createSkill,
  makeCoach,
  futureUtc,
  createCourse,
} = require('./helpers');

describe('M4 公開瀏覽', () => {
  // 共用種子資料：一位教練 + 一個技能 + 一堂未來的課程（全部在這個檔案內現造）
  let coach;
  let skill;
  let futureCourse;
  let coachId;

  beforeAll(async () => {
    coach = await makeCoach();
    skill = await createSkill();
    futureCourse = await createCourse(coach.token, skill.id); // 預設 7 天後開課

    // 取得這位教練在「教練列表」裡的 coach id：
    // 升級教練的回應若有附 coach id 就直接用，沒有就從列表用 user_id 撈
    coachId = coach.coachId;
    if (!coachId) {
      const listRes = await api().get('/api/coaches').query({ per: 10000, page: 1 });
      expectSuccess(listRes);
      const found = (listRes.body.data || []).find((c) => c.user_id === coach.userId);
      coachId = found && found.id;
    }
    expect(coachId).toBeTruthy();
  });

  describe('GET /api/coaches 教練列表', () => {
    test('帶 per 與 page 查詢成功，回傳陣列', async () => {
      const res = await api().get('/api/coaches').query({ per: 100, page: 1 });
      expectSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('列表找得到剛升級的教練，且每筆有 id、user_id、name', async () => {
      // 用很大的 per，確保資料庫就算已累積很多教練也撈得到這一位
      const res = await api().get('/api/coaches').query({ per: 10000, page: 1 });
      expectSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((c) => c.user_id === coach.userId);
      expect(found).toBeTruthy();
      expect(found.id).toBeTruthy();
      expect(found.name).toBe(coach.name);
    });

    test('沒帶 per 與 page 參數時回可預期失敗（4xx + failed）', async () => {
      const res = await api().get('/api/coaches');
      expectFailed(res);
    });
  });

  describe('GET /api/coaches/{coachId} 教練詳情', () => {
    test('查得到教練詳情：data.user.name 正確、data.coach.skills 是陣列', async () => {
      const res = await api().get(`/api/coaches/${coachId}`);
      expectSuccess(res);
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.user).toBeTruthy();
      expect(res.body.data.user.name).toBe(coach.name);
      expect(res.body.data.coach).toBeTruthy();
      expect(Array.isArray(res.body.data.coach.skills)).toBe(true);
      expect(Number(res.body.data.coach.experience_years)).toBe(3);
    });

    test('查不存在的教練（格式合法的 uuid）回可預期失敗', async () => {
      const res = await api().get(`/api/coaches/${crypto.randomUUID()}`);
      expectFailed(res);
    });
  });

  describe('GET /api/coaches/{coachId}/courses 教練的課程列表', () => {
    test('包含剛開的未來課程（end_at > now 口徑），且帶 coach_name 與 skill_name', async () => {
      const res = await api().get(`/api/coaches/${coachId}/courses`);
      expectSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((c) => c.id === futureCourse.id);
      expect(found).toBeTruthy();
      expect(found.name).toBe(futureCourse.name);
      expect(found.coach_name).toBe(coach.name);
      expect(found.skill_name).toBe(skill.name);
      expect(Number(found.max_participants)).toBe(Number(futureCourse.max_participants));
      expect(found.start_at).toBeTruthy();
      expect(found.end_at).toBeTruthy();
    });
  });

  describe('GET /api/courses 進行中課程列表', () => {
    test('成功回傳陣列', async () => {
      const res = await api().get('/api/courses');
      expectSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('還沒開始的未來課程「不會」出現在進行中列表（口徑：start_at <= now < end_at）', async () => {
      const res = await api().get('/api/courses');
      expectSuccess(res);
      const found = (res.body.data || []).find((c) => c.id === futureCourse.id);
      expect(found).toBeUndefined();
    });

    test('已開始且還沒結束的課程「會」出現在進行中列表，且帶 coach_name 與 skill_name', async () => {
      // 文件口徑：開課端點不會擋 start_at 在過去，所以直接造一堂「昨天開始、明天結束」的進行中課程。
      // 如果這裡建立課程就失敗，先檢查你的開課端點是不是多擋了「開始時間不能在過去」— 文件沒有這條規則。
      const ongoing = await createCourse(coach.token, skill.id, {
        start_at: futureUtc(-1), // 昨天開始
        end_at: futureUtc(1), // 明天結束
      });
      const res = await api().get('/api/courses');
      expectSuccess(res);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((c) => c.id === ongoing.id);
      expect(found).toBeTruthy();
      expect(found.name).toBe(ongoing.name);
      expect(found.coach_name).toBe(coach.name);
      expect(found.skill_name).toBe(skill.name);
      expect(Number(found.max_participants)).toBe(Number(ongoing.max_participants));
    });
  });
});
