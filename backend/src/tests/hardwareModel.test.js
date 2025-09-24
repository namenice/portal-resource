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
      .delete(`/api/hardwaremodels/${dataID}`)
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

describe('Hardware Model API', () => {

  // ======= Create =======
  test('POST /api/hardwaremodels - Create ', async () => {
    const res = await request(app)
      .post('/api/hardwaremodels')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        brand: 'testBrand',
        model: 'testModel',
        description: 'test Des'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testDataId = res.body.data.id;
  });

  // ======= Get All =======
  test('GET /api/hardwaremodels - Get All', async () => {
    const res = await request(app)
      .get('/api/hardwaremodels')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Get By ID =======
  test('GET /api/hardwaremodels/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/hardwaremodels/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testDataId);
  });

  // ======= Update =======
  test('PUT /api/hardwaremodels/:id - Update', async () => {
    const res = await request(app)
      .put(`/api/hardwaremodels/${testDataId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        brand: 'testUpdateBrand',
        model: 'testUpdateModel',
        description: 'test Update Des'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('brand', 'testUpdateBrand');
  });

  test('GET /api/hardwaremodels?search=xxx - Search', async () => {
    const res = await request(app)
      .get('/api/hardwaremodels?search=testUpdateBrand')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /api/hardwaremodels/:id - Delete', async () => {
    const res = await request(app)
      .delete(`/api/hardwaremodels/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/hardwaremodels/:id - Not Found', async () => {
    const res = await request(app)
      .get(`/api/hardwaremodels/${testDataId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`Not found id=${testDataId}`);
  });
});
