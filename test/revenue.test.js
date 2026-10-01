/**
 * 營收 API 合約測試。依當年報名建立月份統計，排除取消紀錄。
 * 營收按報名筆數乘以所有方案平均單堂價格後取整數；參與人數另計不重複會員。
 * 測試透過 HTTP 建立獨立資料，不依賴預先建立的帳號或課程。
 */
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

// month 參數收英文小寫月份名，用 Date API 動態取「當月」，不寫死
const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];
const currentMonth = () => MONTH_NAMES[new Date().getMonth()];

/** 用教練 token 查當月營收 */
function getRevenue(coachToken) {
  return api()
    .get('/api/coach/revenue')
    .query({ month: currentMonth() })
    .set('Authorization', `Bearer ${coachToken}`);
}

/**
 * Live 重算單堂均價：GET 全部方案 → Σprice ÷ Σcredit_amount。
 * 一定要在自己種完資料「之後」才打這支重算，期望值才不會被資料庫裡
 * 既有的方案（其他測試種的）影響 —— 髒 DB 也穩定。
 * price 可能是數字或數字字串（如 "1000.00"），一律 Number() 轉值。
 */
async function fetchPerCreditPrice() {
  const res = await api().get('/api/credit-package');
  expectSuccess(res);
  let totalPrice = 0;
  let totalCredits = 0;
  for (const pkg of res.body.data) {
    totalPrice += Number(pkg.price);
    totalCredits += Number(pkg.credit_amount);
  }
  return totalPrice / totalCredits;
}

describe('教練月營收', () => {
  describe('還沒開課的新教練', () => {
    test('教練還沒開任何課：查當月營收，revenue / participants / course_count 都是 0', async () => {
      const coach = await makeCoach();
      const res = await getRevenue(coach.token);
      expectSuccess(res);
      const total = res.body.data.total;
      expect(Number(total.revenue)).toBe(0);
      expect(Number(total.participants)).toBe(0);
      expect(Number(total.course_count)).toBe(0);
    });

    test('一般會員（不是教練）查營收：拒絕', async () => {
      const member = await signupAndLogin();
      const res = await getRevenue(member.token);
      expectFailed(res);
    });
  });

  describe('主場景：一堂課、兩位會員當月報名（非整除均價方案）', () => {
    let coach;
    let course;
    let memberA;
    let memberB;

    beforeAll(async () => {
      // 教練 + 技能 + 一堂未來的課（max 10，名額充足，不會撞到滿員錯誤）
      coach = await makeCoach();
      const skill = await createSkill();
      course = await createCourse(coach.token, skill.id, { max_participants: 10 });

      // 非整除比例方案：3 堂 1000 元 → 均價帶小數，逼出 floor 時機的差異
      const pkg = await createCreditPackage({ credit_amount: 3, price: 1000 });

      // 兩位會員各買方案、各報名這堂課 —— 報名發生在「現在」，計入當月
      memberA = await signupAndLogin();
      memberB = await signupAndLogin();
      expectSuccess(await buyPackage(memberA.token, pkg.id));
      expectSuccess(await buyPackage(memberB.token, pkg.id));
      expectSuccess(await bookCourse(memberA.token, course.id));
      expectSuccess(await bookCourse(memberB.token, course.id));
    }, 30000);

    test('兩筆當月報名：revenue = floor(2 × 全方案均價)、participants = 2、course_count = 2（報名筆數）', async () => {
      // 種完資料之後才 live 重算均價（含資料庫裡所有方案）
      const perCreditPrice = await fetchPerCreditPrice();
      // floor 在最後一步：先乘 2 再 floor，不是先 floor 均價再乘
      const expectedRevenue = Math.floor(2 * perCreditPrice);

      const res = await getRevenue(coach.token);
      expectSuccess(res);
      const total = res.body.data.total;
      expect(Number(total.revenue)).toBe(expectedRevenue);
      expect(Number(total.participants)).toBe(2);
      // ⚠️ course_count 的欄位名有誤導性：語意是「該月未取消的報名筆數」
      //（兩位會員各報一次 = 2），不是課程數 — 詳見 API 文件月營收章節
      expect(Number(total.course_count)).toBe(2);
    });

    test('取消一筆報名後：participants 變 1、course_count 變 1、revenue 變 floor(1 × 均價)（取消的報名不計入）', async () => {
      expectSuccess(await cancelBooking(memberB.token, course.id));

      // 取消後重新 live 重算一次均價，期望值跟著當下資料走
      const perCreditPrice = await fetchPerCreditPrice();
      const expectedRevenue = Math.floor(1 * perCreditPrice);

      const res = await getRevenue(coach.token);
      expectSuccess(res);
      const total = res.body.data.total;
      expect(Number(total.revenue)).toBe(expectedRevenue);
      expect(Number(total.participants)).toBe(1);
      expect(Number(total.course_count)).toBe(1);
    });

    test('同一會員報名兩堂課：人數維持 1，營收仍按 2 筆報名計算', async () => {
      const skill = await createSkill(undefined, coach.token);
      const secondCourse = await createCourse(coach.token, skill.id);
      expectSuccess(await bookCourse(memberA.token, secondCourse.id));
      const perCreditPrice = await fetchPerCreditPrice();
      const res = await getRevenue(coach.token);
      expectSuccess(res);
      expect(Number(res.body.data.total.revenue)).toBe(Math.floor(2 * perCreditPrice));
      expect(Number(res.body.data.total.participants)).toBe(1);
      expect(Number(res.body.data.total.course_count)).toBe(2);
    });
  });
});
