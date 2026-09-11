/**
 * ============================================================================
 * 里程碑 M1 合約測試：種資料 API（技能與方案 CRUD，全 public）+ M0 healthcheck
 * ============================================================================
 *
 * 這個檔案在測什麼：
 * - GET /healthcheck 活著（docker-compose 靠它判斷後端健康，沒做這支前端容器起不來）
 * - 技能（skill）：新增 → 列表查得到 → 刪除 → 列表消失，以及重複/缺欄位/假 id 的失敗行為
 * - 購買方案（credit package）：新增 → 列表查得到且欄位形狀正確 → 刪除，
 *   以及重複/缺欄位的失敗行為
 *
 * 紅燈了怎麼自救（三步）：
 * 1. 看測試名稱 — 每個測試名描述的就是「一個行為」，先搞懂它期待什麼
 * 2. 對照 API 文件 —「技能管理」「購買方案管理」「健康檢查」那幾節的規格
 * 3. 本機重打一次 — 用 curl 或 Postman 對你的 server 打同一支 API，
 *    看狀態碼是不是 2xx/4xx、body 是不是 { status: "success"/"failed", ... }
 *
 * 注意：測試全程黑箱打 HTTP（API_BASE_URL，預設 http://localhost:8080），
 * 不碰你的資料庫；所有名稱都帶亂數，跑幾次都不會互相干擾。
 * ============================================================================
 */
const {
  api,
  randName,
  expectSuccess,
  expectFailed,
  createSkill,
  createCreditPackage,
} = require('./helpers');

/** 合法 uuid「格式」但資料庫裡不存在的假 id（格式錯的 id 不在驗收範圍） */
const FAKE_UUID = '00000000-0000-4000-8000-000000000000';

describe('M0 健康檢查', () => {
  test('GET /healthcheck 回 200（純文字回應，不是 JSON）', async () => {
    const res = await api().get('/healthcheck');
    expect(res.status).toBe(200);
  });
});

describe('M1 技能管理（POST / GET / DELETE /api/coaches/skill，public）', () => {
  test('新增技能成功後，技能列表查得到這筆資料（id 與 name）', async () => {
    const skill = await createSkill();

    const listRes = await api().get('/api/coaches/skill');
    expectSuccess(listRes);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const found = listRes.body.data.find((item) => item.name === skill.name);
    expect(found).toBeDefined();
    expect(found.id).toBe(skill.id);
    expect(found.name).toBe(skill.name);
  });

  test('用已存在的技能名稱再新增一次，會被拒絕（失敗回應）', async () => {
    const skill = await createSkill();

    const dupRes = await api().post('/api/coaches/skill').send({ name: skill.name });
    expectFailed(dupRes);
  });

  test('新增技能沒帶 name 欄位，會被拒絕（失敗回應）', async () => {
    const res = await api().post('/api/coaches/skill').send({});
    expectFailed(res);
  });

  test('刪除技能成功後，技能列表不再出現這筆資料', async () => {
    const skill = await createSkill();

    const delRes = await api().delete(`/api/coaches/skill/${skill.id}`);
    expectSuccess(delRes);

    const listRes = await api().get('/api/coaches/skill');
    expectSuccess(listRes);
    const found = listRes.body.data.find((item) => item.id === skill.id);
    expect(found).toBeUndefined();
  });

  test('刪除一個不存在的技能 id（uuid 格式正確但查無資料），會被拒絕（失敗回應）', async () => {
    const res = await api().delete(`/api/coaches/skill/${FAKE_UUID}`);
    expectFailed(res);
  });
});

describe('M1 購買方案管理（POST / GET / DELETE /api/credit-package，public）', () => {
  test('新增方案成功後，方案列表查得到這筆資料且欄位形狀正確（id/name/credit_amount/price）', async () => {
    const pkg = await createCreditPackage({ credit_amount: 7, price: 1400 });

    const listRes = await api().get('/api/credit-package');
    expectSuccess(listRes);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const found = listRes.body.data.find((item) => item.name === pkg.name);
    expect(found).toBeDefined();
    expect(typeof found.id).toBe('string');
    expect(found.name).toBe(pkg.name);
    // 數值欄位可能回數字或數字字串（資料庫 numeric 型別），用 Number() 轉值比對
    expect(Number(found.credit_amount)).toBe(7);
    expect(Number(found.price)).toBe(1400);
  });

  test('用已存在的方案名稱再新增一次，會被拒絕（失敗回應）', async () => {
    const pkg = await createCreditPackage();

    const dupRes = await api().post('/api/credit-package').send({
      name: pkg.name,
      credit_amount: 5,
      price: 1000,
    });
    expectFailed(dupRes);
  });

  test('新增方案缺少 price 欄位，會被拒絕（失敗回應）', async () => {
    const res = await api().post('/api/credit-package').send({
      name: randName('方案'),
      credit_amount: 7,
    });
    expectFailed(res);
  });

  test('新增方案缺少 name 欄位，會被拒絕（失敗回應）', async () => {
    const res = await api().post('/api/credit-package').send({
      credit_amount: 7,
      price: 1400,
    });
    expectFailed(res);
  });

  test('刪除方案成功後，方案列表不再出現這筆資料', async () => {
    const pkg = await createCreditPackage();

    const delRes = await api().delete(`/api/credit-package/${pkg.id}`);
    expectSuccess(delRes);

    const listRes = await api().get('/api/credit-package');
    expectSuccess(listRes);
    const found = listRes.body.data.find((item) => item.id === pkg.id);
    expect(found).toBeUndefined();
  });
});
