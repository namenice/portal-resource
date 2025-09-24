// tests/hardwareStatus.test.js
const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const { connectDB, closeDB } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api', routes);

let testHardwareStatusId;
let token;

const createdDataTest = [];
const createdUsers = [];

beforeAll(async () => {
  await connectDB();

  // สร้าง user สำหรับ login (หากยังไม่มีใน DB)
  const userRes = await request(app)
    .post('/api/users')
    .send({ username: 'testuser2', password: '123456' });

  if (userRes.body.data?.id) createdUsers.push(userRes.body.data.id);

  // login เพื่อเอา token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testuser2', password: '123456' });

  token = loginRes.body.data.token;
});

afterAll(async () => {
  // ลบ hardwareStatus ที่สร้างระหว่าง test
  for (const dataID of createdDataTest) {
    await request(app)
      .delete(`/api/hardwarestatus/${dataID}`)
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

describe('HardwareStatus API', () => {

  test('POST /api/hardwarestatus - create hardwareStatus', async () => {
    const res = await request(app)
      .post('/api/hardwarestatus')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Running' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testHardwareStatusId = res.body.data.id;
    createdDataTest.push(testHardwareStatusId);
  });

  test('GET /api/hardwarestatus - get all hardwareStatuses', async () => {
    const res = await request(app)
      .get('/api/hardwarestatus')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/hardwarestatus/:id - get hardwareStatus by id', async () => {
    const res = await request(app)
      .get(`/api/hardwarestatus/${testHardwareStatusId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testHardwareStatusId);
  });

  test('PUT /api/hardwarestatus/:id - update hardwareStatus', async () => {
    const res = await request(app)
      .put(`/api/hardwarestatus/${testHardwareStatusId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Stopped' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'Stopped');
  });

  test('GET /api/hardwarestatus?search=xxx - search hardwareStatus', async () => {
    const res = await request(app)
      .get('/api/hardwarestatus?search=Stop')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /api/hardwarestatus/:id - delete hardwareStatus', async () => {
    const res = await request(app)
      .delete(`/api/hardwarestatus/${testHardwareStatusId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/hardwarestatus/:id - Hardware Status not found', async () => {
    const res = await request(app)
      .get(`/api/hardwarestatus/${testHardwareStatusId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Hardware Status not found');
  });
});
