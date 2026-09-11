/**
 * ============================================================================
 * M5 購買與報名 — 合約測試（黑箱）
 * ============================================================================
 *
 * 這個里程碑在測什麼：
 * 1. 會員購買堂數方案（POST /api/credit-package/:creditPackageId）
 *    與購買紀錄查詢（GET /api/users/credit-package）
 * 2. 會員報名課程（POST /api/courses/:courseId）的完整檢查順序：
 *    課程存在 → 是否已報名過（含已取消）→ 剩餘堂數 → 課程名額
 * 3. 四句「一字不差」的 UI 合約訊息（前端靠逐字比對開 modal，錯一個字就壞）：
 *    「請先登入」「已經報名過此課程」「已無可使用堂數」「已達最大參加人數，無法參加」
 * 4. 取消報名是「軟刪除」：紀錄還在（cancelled_at 標時間）、堂數加回來、
 *    而且取消過的課「不能」再報名一次
 * 5. 本人課表（GET /api/users/courses）的 credit_remain 與 course_booking 形狀
 *
 * 紅燈時的三步自救：
 * 1. 看測試名稱 — 名稱描述的就是「預期行為」，先搞懂預期是什麼
 * 2. 對照 API 文件「課程報名」與「購買方案」章節 — 確認你的檢查順序與訊息文字
 * 3. 用 Postman / curl 本機重打一次同樣的請求，看你的 server 實際回了什麼
 */
const { randomUUID } = require('crypto');
const {
  api,
  expectSuccess,
  expectFailed,
  signupAndLogin,
  createSkill,
  createCreditPackage,
  makeCoach,
  createCourse,
  buyPackage,
  bookCourse,
  cancelBooking,
} = require('./helpers');

describe('M5-1 購買堂數方案', () => {
  test('會員可以成功購買方案', async () => {
    const member = await signupAndLogin();
    const pkg = await createCreditPackage();

    const res = await buyPackage(member.token, pkg.id);
    expectSuccess(res);
  });

  test('購買後 GET /api/users/credit-package 看得到這筆紀錄（堂數與金額正確）', async () => {
    const member = await signupAndLogin();
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });

    const buyRes = await buyPackage(member.token, pkg.id);
    expectSuccess(buyRes);

    const res = await api()
      .get('/api/users/credit-package')
      .set('Authorization', `Bearer ${member.token}`);
    expectSuccess(res);
    expect(Array.isArray(res.body.data)).toBe(true);

    const record = res.body.data.find((item) => item.name === pkg.name);
    expect(record).toBeDefined();
    expect(Number(record.purchased_credits)).toBe(pkg.credit_amount);
    expect(Number(record.price_paid)).toBe(pkg.price);
  });

  test('購買不存在的方案（合法 uuid）會失敗', async () => {
    const member = await signupAndLogin();

    const res = await buyPackage(member.token, randomUUID());
    expectFailed(res);
  });
});

describe('M5-2 報名課程成功路徑', () => {
  test('買方案後報名課程成功，課表的 credit_remain 會少 1、course_booking 看得到該課', async () => {
    // 自建教練 + 課程（名額 10，絕對夠）
    const coach = await makeCoach();
    const skill = await createSkill();
    const course = await createCourse(coach.token, skill.id, { max_participants: 10 });

    // 全新會員買 7 堂方案後報名
    const member = await signupAndLogin();
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });
    expectSuccess(await buyPackage(member.token, pkg.id));

    const bookRes = await bookCourse(member.token, course.id);
    expectSuccess(bookRes);

    // 課表合約：credit_remain = 買的堂數 − 1，course_booking 含該課（有 name / coach_name）
    const res = await api()
      .get('/api/users/courses')
      .set('Authorization', `Bearer ${member.token}`);
    expectSuccess(res);
    expect(Number(res.body.data.credit_remain)).toBe(pkg.credit_amount - 1);

    const bookings = res.body.data.course_booking;
    expect(Array.isArray(bookings)).toBe(true);
    const booked = bookings.find((b) => b.course_id === course.id);
    expect(booked).toBeDefined();
    expect(booked.name).toBe(course.name);
    expect(booked.coach_name).toBeTruthy();
  });
});

describe('M5-3 四句逐字 UI 合約（前端 modal 靠這些字串，一字不能差）', () => {
  test('沒帶 token 報名 → 失敗且 message 逐字等於「請先登入」', async () => {
    // 課程真實存在，唯一的錯誤條件只有「沒登入」
    const coach = await makeCoach();
    const skill = await createSkill();
    const course = await createCourse(coach.token, skill.id, { max_participants: 10 });

    const res = await api().post(`/api/courses/${course.id}`).send({});
    expectFailed(res);
    expect(res.body.message).toBe('請先登入');
  });

  test('報名一堂不存在的課程（合法 uuid 但查無此課）→ 失敗（檢查：課程不存在）', async () => {
    // courseId 查無此課程。會員有堂數、也沒報過任何課，
    // 「ID錯誤」不在四句固定訊息裡（驗收只看 4xx + status: failed），所以這裡不逐字比對 message。
    const member = await signupAndLogin();
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });
    expectSuccess(await buyPackage(member.token, pkg.id));

    const res = await bookCourse(member.token, randomUUID());
    expectFailed(res);
  });

  test('同一會員報同一堂課第二次 → 失敗且 message 逐字等於「已經報名過此課程」', async () => {
    // 堂數充足（7 堂）、名額充足（10 人），唯一的錯誤條件只有「已報名」
    const coach = await makeCoach();
    const skill = await createSkill();
    const course = await createCourse(coach.token, skill.id, { max_participants: 10 });

    const member = await signupAndLogin();
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });
    expectSuccess(await buyPackage(member.token, pkg.id));
    expectSuccess(await bookCourse(member.token, course.id));

    const res = await bookCourse(member.token, course.id);
    expectFailed(res);
    expect(res.body.message).toBe('已經報名過此課程');
  });

  test('沒買過任何方案的會員報名 → 失敗且 message 逐字等於「已無可使用堂數」', async () => {
    // 名額充足（10 人）、沒報過這堂課，唯一的錯誤條件只有「沒有堂數」
    const coach = await makeCoach();
    const skill = await createSkill();
    const course = await createCourse(coach.token, skill.id, { max_participants: 10 });

    const member = await signupAndLogin(); // 全新會員，從沒買過方案

    const res = await bookCourse(member.token, course.id);
    expectFailed(res);
    expect(res.body.message).toBe('已無可使用堂數');
  });

  test('課程已報滿時報名 → 失敗且 message 逐字等於「已達最大參加人數，無法參加」', async () => {
    // 開一堂名額只有 1 的課，會員 A 報滿它
    const coach = await makeCoach();
    const skill = await createSkill();
    const course = await createCourse(coach.token, skill.id, { max_participants: 1 });
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });

    const memberA = await signupAndLogin();
    expectSuccess(await buyPackage(memberA.token, pkg.id));
    expectSuccess(await bookCourse(memberA.token, course.id));

    // 會員 B 有堂數、沒報過這堂課，唯一的錯誤條件只有「名額已滿」
    const memberB = await signupAndLogin();
    expectSuccess(await buyPackage(memberB.token, pkg.id));

    const res = await bookCourse(memberB.token, course.id);
    expectFailed(res);
    expect(res.body.message).toBe('已達最大參加人數，無法參加');
  });
});

describe('M5-4 取消報名（軟刪除語意）', () => {
  test('取消報名成功：紀錄留著（cancelled_at 標時間）、堂數加回來', async () => {
    const coach = await makeCoach();
    const skill = await createSkill();
    const course = await createCourse(coach.token, skill.id, { max_participants: 10 });

    const member = await signupAndLogin();
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });
    expectSuccess(await buyPackage(member.token, pkg.id));
    expectSuccess(await bookCourse(member.token, course.id));

    const cancelRes = await cancelBooking(member.token, course.id);
    expectSuccess(cancelRes);

    // 課表合約：紀錄還在但 cancelled_at 非 null，credit_remain 回到買的堂數
    const res = await api()
      .get('/api/users/courses')
      .set('Authorization', `Bearer ${member.token}`);
    expectSuccess(res);
    expect(Number(res.body.data.credit_remain)).toBe(pkg.credit_amount);

    const booked = res.body.data.course_booking.find((b) => b.course_id === course.id);
    expect(booked).toBeDefined();
    expect(booked.cancelled_at).not.toBeNull();
  });

  test('同一堂課取消第二次 → 失敗（已經沒有可取消的報名）', async () => {
    const coach = await makeCoach();
    const skill = await createSkill();
    const course = await createCourse(coach.token, skill.id, { max_participants: 10 });

    const member = await signupAndLogin();
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });
    expectSuccess(await buyPackage(member.token, pkg.id));
    expectSuccess(await bookCourse(member.token, course.id));
    expectSuccess(await cancelBooking(member.token, course.id));

    const res = await cancelBooking(member.token, course.id);
    expectFailed(res);
  });

  test('取消過的課不能再報名 → 失敗且 message 逐字等於「已經報名過此課程」', async () => {
    // 軟刪除語意：重複報名檢查「包含已取消的紀錄」
    const coach = await makeCoach();
    const skill = await createSkill();
    const course = await createCourse(coach.token, skill.id, { max_participants: 10 });

    const member = await signupAndLogin();
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });
    expectSuccess(await buyPackage(member.token, pkg.id));
    expectSuccess(await bookCourse(member.token, course.id));
    expectSuccess(await cancelBooking(member.token, course.id));

    // 此時堂數充足（取消後加回 7 堂）、名額充足，唯一擋下來的理由是「報名過（含取消）」
    const res = await bookCourse(member.token, course.id);
    expectFailed(res);
    expect(res.body.message).toBe('已經報名過此課程');
  });
});
