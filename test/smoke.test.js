/**
 * 服務啟動檢查：健康狀態、會員註冊、登入與堂數方案查詢。
 */
const h = require('./helpers');

describe('Smoke：容器裡的後端基本功能', () => {
  test('GET /healthcheck 活著', async () => {
    const res = await h.api().get('/healthcheck');
    expect(res.status).toBe(200);
  });

  test('能註冊新會員', async () => {
    const { res } = await h.signup();
    h.expectSuccess(res);
  });

  test('能登入並拿到合法 JWT', async () => {
    const user = await h.signupAndLogin();
    expect(user.token).toBeTruthy();
    expect(user.userId).toBeTruthy();
  });

  test('能讀健身方案列表', async () => {
    const res = await h.api().get('/api/credit-package');
    h.expectSuccess(res);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
