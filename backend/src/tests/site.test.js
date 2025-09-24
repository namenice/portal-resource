const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const { connectDB, closeDB } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api', routes);

let token;

const createdDataTest = [];
const createdUsers = [];

beforeAll(async () => {
  await connectDB();

  // สร้าง user สำหรับ login (หากยังไม่มีใน DB)
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
  // ลบ data ที่สร้างระหว่าง test
  for (const dataID of createdDataTest) {
    await request(app)
      .delete(`/api/sites/${dataID}`)
      .set('Authorization', `Bearer ${token}`);
  }

  // ลบ user ที่สร้างระหว่าง test
  for (const userId of createdUsers) {
    await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
  }
  await closeDB();
});

describe('sites API', () => {

  test('POST /api/sites - create sites', async () => {
    const res = await request(app)
      .post('/api/sites')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'sitesTest' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testDataId = res.body.data.id;
  });

  test('GET /api/sites - get all sites', async () => {
    const res = await request(app)
      .get('/api/sites')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/sites/:id - get sites by id', async () => {
    const res = await request(app)
      .get(`/api/sites/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testDataId);
  });

  test('PUT /api/sites/:id - update sites', async () => {
    const res = await request(app)
      .put(`/api/sites/${testDataId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'dataUpdate'});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'dataUpdate');
  });

  test('GET /api/sites?search=xxx - search sites', async () => {
    const res = await request(app)
      .get('/api/sites?search=data')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /api/sites/:id - delete sites', async () => {
    const res = await request(app)
      .delete(`/api/sites/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/sites/:id - sites not found', async () => {
    const res = await request(app)
      .get(`/api/sites/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Site not found');
  });
});
