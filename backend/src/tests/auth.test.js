const request = require('supertest');
const app = require('../app');
const { connectDB, closeDB } = require('../config/database');

describe('Auth API', () => {
  const authTestUser = {
    username: 'authtest',
    password: 'testpassword'
  };

let token;
const createdUsers = [];

  beforeAll(async () => {
    await connectDB();
    // สร้าง user สำหรับ login (หากยังไม่มีใน DB)
    const userRes = await request(app)
      .post('/api/users')
      .send({ username: authTestUser.username, password: authTestUser.password });

    if (userRes.body.data?.id) createdUsers.push(userRes.body.data.id);

    // login เพื่อเอา token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: authTestUser.username, password: authTestUser.password });

    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    // ลบ user ที่สร้างระหว่าง test
    for (const userId of createdUsers) {
      await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
    }
    await closeDB();
  });

  test('✅ POST /api/auth/login - success login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: authTestUser.username,
        password: authTestUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // ตรวจ token
    expect(res.body.data).toHaveProperty('token');
    expect(typeof res.body.data.token).toBe('string');

    // ตรวจ user
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.username).toBe(authTestUser.username);
  });

  test('❌ POST /api/auth/login - wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: authTestUser.username,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  test('❌ POST /api/auth/login - user not found', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'notexistuser',
        password: 'somepassword',
      });

    expect(res.statusCode).toBe(401); // เพราะ service โยน UnauthorizedError
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  test('❌ POST /api/auth/login - missing username/password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: '', password: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Username and password required');
  });
});
