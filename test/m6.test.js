/**
 * M6 合約測試：教練月營收（挑戰）
 * GET /api/admin/coaches/revenue?month={英文小寫月份名}
 *
 * 這個里程碑在測什麼：
 * - 教練查「自己」的當月營收統計，回傳 data.total = { revenue, participants, course_count }
 * - 三條隱形語意（文件「教練後台 — 月營收」一節有明文，最容易踩雷）：
 *   ① 報名以「報名建立時間」計入該月 —— 不是課程上課時間
 *   ② 年份固定為伺服器當年；?month= 收英文小寫月份名（january ~ december），不是數字
 *   ③ 單堂均價 = 「全部」方案的 Σprice ÷ Σcredit_amount；
 *      營收 = Math.floor(該月未取消報名數 × 均價)，floor 必須在乘完之後才做
 * - 取消是軟刪除：取消掉的報名不算人數、也不算營收（「未取消」口徑）
 *
 * 紅燈時的三步自救：
 * 1. 看測試名稱 —— 名稱描述的是「行為」，先搞清楚是哪個行為跟預期不符
 * 2. 對照 API 文件「教練後台 — 月營收」一節，逐條核對公式、month 參數格式、未取消口徑
 * 3. 本機用 curl / Postman 重打一次同樣的請求（自己種一筆報名再查），看實際回了什麼
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
    .get('/api/admin/coaches/revenue')
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

describe('M6 教練月營收', () => {
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
      //（兩位會員各報一次 = 2），不是課程數 — 詳見 API 文件 M6 一節
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
  });
});
