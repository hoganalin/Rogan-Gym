/**
 * Smoke 測試 — 容器化壓軸用
 *
 * 後端容器化後，行為要跟本機開發時一模一樣。
 * 這裡只走一條最小黃金路徑：活著 → 能註冊 → 能登入 → 能讀方案。
 * 細節合約由 m1~m6 把關，這裡不重複。
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
