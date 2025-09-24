// tests/user.test.js
const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const { connectDB, closeDB } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api', routes);

let testDataId;
let token;

// เก็บข้อมูลที่สร้างเพื่อ clean up
const createdData = [];
const createdUsers = [];

beforeAll(async () => {
  await connectDB();

  // สร้าง user สำหรับ login
  const userRes = await request(app)
    .post('/api/users')
    .send({ username: 'testuser', password: '123456' });

  if (userRes.body.data?.id) createdUsers.push(userRes.body.data.id);

  // login เพื่อเอา token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testuser', password: '123456' });

  token = loginRes.body.data.token;
});

afterAll(async () => {
  for (const dataId of createdData) {
    await request(app)
      .delete(`/api/users/${dataId}`)
      .set('Authorization', `Bearer ${token}`);
  }
  for (const userId of createdUsers) {
    await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
  }

  await closeDB();
});

describe('Users API', () => {

  test('POST /api/users - Create', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'userfortest', password: 'Testdescription' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testDataId = res.body.data.id;
    createdData.push(testDataId);
  });

  test('GET /api/users - Get All', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/users/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/users/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testDataId);
  });

  test('PUT /api/users/:id - Updated', async () => {
    const res = await request(app)
      .put(`/api/users/${testDataId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'Updated', password: '654321' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('username', 'Updated');
  });

  test('GET /api/users?search=xxx - Search', async () => {
    const res = await request(app)
      .get('/api/users?search=admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /api/users/:id - delete status', async () => {
    const res = await request(app)
      .delete(`/api/users/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // remove จาก createdData เพื่อไม่ลบซ้ำใน afterAll
    createdData.splice(createdData.indexOf(testDataId), 1);
  });

  test('GET /api/users/:id - Get not found', async () => {
    const res = await request(app)
      .get(`/api/users/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('User not found');
  });
});
