/**
 * 會員 API 合約測試。涵蓋註冊、登入、JWT、個人資料與密碼變更。
 * 測試透過 HTTP 建立獨立資料，不依賴預先建立的帳號或課程。
 */
const jwt = require('jsonwebtoken');
const {
  api,
  randEmail,
  randName,
  VALID_PASSWORD,
  expectSuccess,
  expectFailed,
  signup,
  login,
  signupAndLogin,
} = require('./helpers');

describe('會員系統', () => {
  describe('POST /api/users/signup 註冊', () => {
    test('用合法的名稱、Email、密碼註冊成功，回傳的 user 要有 id 與 name', async () => {
      const name = randName('會員');
      const res = await api()
        .post('/api/users/signup')
        .send({ name, email: randEmail(), password: VALID_PASSWORD });
      expectSuccess(res);
      expect(typeof res.body.data.user.id).toBe('string');
      expect(res.body.data.user.id.length).toBeGreaterThan(0);
      expect(res.body.data.user.name).toBe(name);
    });

    test('同一個 Email 註冊第二次要失敗', async () => {
      const first = await signup();
      expectSuccess(first.res);
      const res = await api()
        .post('/api/users/signup')
        .send({ name: randName('會員'), email: first.email, password: VALID_PASSWORD });
      expectFailed(res);
    });

    test('密碼不符合規則（例如「123」）要被擋下', async () => {
      const res = await api()
        .post('/api/users/signup')
        .send({ name: randName('會員'), email: randEmail(), password: '123' });
      expectFailed(res);
    });

    test('缺少 Email 欄位要被擋下', async () => {
      const res = await api()
        .post('/api/users/signup')
        .send({ name: randName('會員'), password: VALID_PASSWORD });
      expectFailed(res);
    });
  });

  describe('POST /api/users/login 登入', () => {
    test('用正確帳密登入成功，拿到 token（JWT payload 含 id / role=USER / exp）與本人 name', async () => {
      const user = await signup();
      expectSuccess(user.res);
      const { token, res } = await login(user.email, user.password);
      expectSuccess(res);
      expect(typeof token).toBe('string');
      const payload = jwt.decode(token);
      expect(payload).not.toBeNull();
      expect(payload.id).toBeTruthy();
      expect(payload.role).toBe('USER');
      expect(payload.exp).toBeTruthy();
      expect(res.body.data.user.name).toBe(user.name);
    });

    test('密碼錯誤要登入失敗', async () => {
      const user = await signup();
      expectSuccess(user.res);
      const { res } = await login(user.email, 'Aa87654321');
      expectFailed(res);
    });

    test('不存在的 Email 要登入失敗', async () => {
      const { res } = await login(randEmail(), VALID_PASSWORD);
      expectFailed(res);
    });
  });

  describe('GET /api/users/profile 取得個人資料', () => {
    test('帶 token 查詢，回傳的 user 要有本人的 email 與 name', async () => {
      const user = await signupAndLogin();
      const res = await api()
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${user.token}`);
      expectSuccess(res);
      expect(res.body.data.user.email).toBe(user.email);
      expect(res.body.data.user.name).toBe(user.name);
    });

    test('不帶 token 查詢要被擋下，且訊息為「請先登入」', async () => {
      const res = await api().get('/api/users/profile');
      expectFailed(res);
      expect(res.body.message).toBe('請先登入');
    });
  });

  describe('PUT /api/users/profile 更新暱稱', () => {
    test('改名成功後，再查個人資料要看到新名字', async () => {
      const user = await signupAndLogin();
      const newName = randName('新名');
      const putRes = await api()
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ name: newName });
      expectSuccess(putRes);

      const getRes = await api()
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${user.token}`);
      expectSuccess(getRes);
      expect(getRes.body.data.user.name).toBe(newName);
    });
  });

  describe('PUT /api/users/password 修改密碼', () => {
    test('修改密碼成功後，舊密碼要登不進去、新密碼要登得進去', async () => {
      const user = await signupAndLogin();
      const newPassword = 'Bb87654321';
      const res = await api()
        .put('/api/users/password')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          password: user.password,
          new_password: newPassword,
          confirm_new_password: newPassword,
        });
      expectSuccess(res);

      const oldLogin = await login(user.email, user.password);
      expectFailed(oldLogin.res);

      const newLogin = await login(user.email, newPassword);
      expectSuccess(newLogin.res);
    });

    test('新密碼不符合規則（例如「123」）要被擋下', async () => {
      const user = await signupAndLogin();
      const res = await api()
        .put('/api/users/password')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          password: user.password,
          new_password: '123',
          confirm_new_password: '123',
        });
      expectFailed(res);
    });
  });
});
