/**
 * 技能與堂數方案 API 合約測試。涵蓋健康檢查、CRUD、欄位驗證與重複資料處理。
 * 測試透過 HTTP 建立獨立資料，不依賴預先建立的帳號或課程。
 */
const {
  api,
  randName,
  expectSuccess,
  expectFailed,
  createSkill,
  createCreditPackage,
  makeCoach,
} = require('./helpers');

/** 合法 uuid「格式」但資料庫裡不存在的假 id（格式錯誤的 id 由另一組測試涵蓋） */
const FAKE_UUID = '00000000-0000-4000-8000-000000000000';

describe('健康檢查', () => {
  test('GET /healthcheck 回 200（純文字回應，不是 JSON）', async () => {
    const res = await api().get('/healthcheck');
    expect(res.status).toBe(200);
  });
});

describe('技能管理（POST / GET / DELETE /api/coaches/skill）', () => {
  let manager;

  beforeEach(async () => {
    manager = await makeCoach();
  });

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

    const dupRes = await api()
      .post('/api/coaches/skill')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ name: skill.name });
    expectFailed(dupRes);
  });

  test('新增技能沒帶 name 欄位，會被拒絕（失敗回應）', async () => {
    const res = await api()
      .post('/api/coaches/skill')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({});
    expectFailed(res);
  });

  test('刪除技能成功後，技能列表不再出現這筆資料', async () => {
    const skill = await createSkill();

    const delRes = await api()
      .delete(`/api/coaches/skill/${skill.id}`)
      .set('Authorization', `Bearer ${manager.token}`);
    expectSuccess(delRes);

    const listRes = await api().get('/api/coaches/skill');
    expectSuccess(listRes);
    const found = listRes.body.data.find((item) => item.id === skill.id);
    expect(found).toBeUndefined();
  });

  test('刪除一個不存在的技能 id（uuid 格式正確但查無資料），會被拒絕（失敗回應）', async () => {
    const res = await api()
      .delete(`/api/coaches/skill/${FAKE_UUID}`)
      .set('Authorization', `Bearer ${manager.token}`);
    expectFailed(res);
  });
});

describe('購買方案管理（POST / GET / DELETE /api/credit-package）', () => {
  let manager;

  beforeEach(async () => {
    manager = await makeCoach();
  });

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

    const dupRes = await api()
      .post('/api/credit-package')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ name: pkg.name, credit_amount: 5, price: 1000 });
    expectFailed(dupRes);
  });

  test('新增方案缺少 price 欄位，會被拒絕（失敗回應）', async () => {
    const res = await api()
      .post('/api/credit-package')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ name: randName('方案'), credit_amount: 7 });
    expectFailed(res);
  });

  test('新增方案缺少 name 欄位，會被拒絕（失敗回應）', async () => {
    const res = await api()
      .post('/api/credit-package')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ credit_amount: 7, price: 1400 });
    expectFailed(res);
  });

  test('刪除方案成功後，方案列表不再出現這筆資料', async () => {
    const pkg = await createCreditPackage();

    const delRes = await api()
      .delete(`/api/credit-package/${pkg.id}`)
      .set('Authorization', `Bearer ${manager.token}`);
    expectSuccess(delRes);

    const listRes = await api().get('/api/credit-package');
    expectSuccess(listRes);
    const found = listRes.body.data.find((item) => item.id === pkg.id);
    expect(found).toBeUndefined();
  });
});
