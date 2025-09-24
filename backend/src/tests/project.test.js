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
      .delete(`/api/projects/${dataID}`)
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
  test('POST /api/projects - Create ', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        name: 'testData1',
        owner: 'testData2',
        description: 'test Des'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testDataId = res.body.data.id;
  });

  // ======= Get All =======
  test('GET /api/projects - Get All', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Get By ID =======
  test('GET /api/projects/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/projects/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testDataId);
  });

  // ======= Update =======
  test('PUT /api/projects/:id - Update', async () => {
    const res = await request(app)
      .put(`/api/projects/${testDataId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        name: 'testUpdateData1',
        owner: 'testUpdateData2',
        description: 'test Update Des'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'testUpdateData1');
  });

  test('GET /api/projects?search=xxx - Search', async () => {
    const res = await request(app)
      .get('/api/projects?search=testUpdateData1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /api/projects/:id - Delete', async () => {
    const res = await request(app)
      .delete(`/api/projects/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/projects/:id - Not Found', async () => {
    const res = await request(app)
      .get(`/api/projects/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`Not found id=${testDataId}`);
  });
});
