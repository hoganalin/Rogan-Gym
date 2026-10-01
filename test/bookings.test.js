/**
 * 購買與預約 API 合約測試。涵蓋額度計算、名額檢查、取消與錯誤訊息。
 * 測試透過 HTTP 建立獨立資料，不依賴預先建立的帳號或課程。
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

describe('購買堂數方案', () => {
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

describe('報名課程成功路徑', () => {
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

describe('預約錯誤訊息合約', () => {
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
    // 「ID錯誤」不在四句固定訊息裡（這裡只檢查 4xx + status: failed），所以不逐字比對 message。
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

describe('取消報名（軟刪除語意）', () => {
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
