// src/tests/hardwares.test.js
const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const { connectDB, closeDB } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api', routes);

let testDataId;
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
  // ลบ hardwares ที่สร้างระหว่าง test
  for (const dataID of createdDataTest) {
    await request(app)
      .delete(`/api/hardwares/${dataID}`)
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

describe('hardwares API', () => {

  // ======= Create =======
  test('POST /api/hardwares - Create', async () => {
    const res = await request(app)
      .post('/api/hardwares')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        hostname: 'testhost1',
        status_id: 1,
        type_id: 1,
        model_id: 1,
        owner: 'admin',
        location_id: 1,
        unit_range: 'U1'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testDataId = res.body.data.id;
    testDataName = res.body.data.hostname;
    createdDataTest.push(testDataId);
  });

  // ======= Get All =======
  test('GET /api/hardwares - Get All', async () => {
    const res = await request(app)
      .get('/api/hardwares')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Get By ID =======
  test('GET /api/hardwares/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/hardwares/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testDataId);
  });

  // ======= Update =======
  test('PUT /api/hardwares/:id - Update', async () => {
    const res = await request(app)
      .put(`/api/hardwares/${testDataId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ owner: 'admin_updated' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.owner).toBe('admin_updated');
  });

  // ======= Search =======
  test('GET /api/hardwares?search=xxx - Search', async () => {
    const res = await request(app)
      .get('/api/hardwares?search=testhost1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Find by hostname =======
  test('GET /api/hardwares/hostname/:hostname - Find by hostname', async () => {
    const res = await request(app)
      .get(`/api/hardwares/hostname/testhost1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hostname).toBe('testhost1');
  });

  // ======= Find by cluster =======
  test('GET /api/hardwares/cluster/:cluster_id - Find by cluster', async () => {
    const res = await request(app)
      .get(`/api/hardwares/cluster/1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Find by location =======
  test('GET /api/hardwares/location/:location_id - Find by location', async () => {
    const res = await request(app)
      .get(`/api/hardwares/location/1`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Delete =======
  test('DELETE /api/hardwares/:id - Delete', async () => {
    const res = await request(app)
      .delete(`/api/hardwares/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/hardwares/:id - Not Found', async () => {
    const res = await request(app)
      .get(`/api/hardwares/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`Not found id=${testDataId}`);
  });

  
});
