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
  // ลบ vendor ที่สร้างระหว่าง test
  for (const dataID of createdDataTest) {
    await request(app)
      .delete(`/api/locations/${dataID}`)
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

describe('Project API', () => {

  // ======= Create =======
  test('POST /api/locations - Create ', async () => {
    const res = await request(app)
      .post('/api/locations')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        site_id: '1',
        room: 'testData1',
        rack: 'testData2'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testDataId = res.body.data.id;
  });

  // ======= Get All =======
  test('GET /api/locations - Get All', async () => {
    const res = await request(app)
      .get('/api/locations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Get By ID =======
  test('GET /api/locations/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/locations/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testDataId);
  });

  // ======= Update =======
  test('PUT /api/locations/:id - Update', async () => {
    const res = await request(app)
      .put(`/api/locations/${testDataId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        site_id: '2',
        room: 'testUpdateData1',
        rack: 'testUpdateData2'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.room).toBe('testUpdateData1');
    expect(res.body.data.rack).toBe('testUpdateData2');
  });

  test('GET /api/locations?search=xxx - Search', async () => {
    const res = await request(app)
      .get('/api/locations?search=testUpdateData1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /api/locations/:id - Delete', async () => {
    const res = await request(app)
      .delete(`/api/locations/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/locations/:id - Not Found', async () => {
    const res = await request(app)
      .get(`/api/locations/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`Not found id=${testDataId}`);
  });
});
