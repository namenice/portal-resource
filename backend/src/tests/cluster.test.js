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
  for (const dataID of createdDataTest) {
    await request(app)
      .delete(`/api/clusters/${dataID}`)
      .set('Authorization', `Bearer ${token}`);
  }

  for (const userId of createdUsers) {
    await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
  }
  await closeDB();
});

describe('Cluster API', () => {

  // ======= Create =======
  test('POST /api/clusters - Create ', async () => {
    const res = await request(app)
      .post('/api/clusters')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        name: 'testData1',
        project_id: '1',
        description: 'test Des'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testDataId = res.body.data.id;
  });

  // ======= Get All =======
  test('GET /api/clusters - Get All', async () => {
    const res = await request(app)
      .get('/api/clusters')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Get By ID =======
  test('GET /api/clusters/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/clusters/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testDataId);
  });

  // ======= Update =======
  test('PUT /api/clusters/:id - Update', async () => {
    const res = await request(app)
      .put(`/api/clusters/${testDataId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        name: 'testUpdateData1',
        prodject_id: '2',
        description: 'test Update Des'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'testUpdateData1');
  });

  test('GET /api/clusters?search=xxx - Search', async () => {
    const res = await request(app)
      .get('/api/clusters?search=testUpdateData1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /api/clusters/:id - Delete', async () => {
    const res = await request(app)
      .delete(`/api/clusters/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/clusters/:id - Not Found', async () => {
    const res = await request(app)
      .get(`/api/clusters/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`Not found id=${testDataId}`);
  });
});
