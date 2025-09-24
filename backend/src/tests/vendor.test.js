const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const { connectDB, closeDB } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api', routes);

let testVendorId;
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
      .delete(`/api/vendors/${dataID}`)
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

describe('Vendor API', () => {

  test('POST /api/vendors - create vendor', async () => {
    const res = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'vendorTest' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testVendorId = res.body.data.id;
  });

  test('GET /api/vendors - get all vendors', async () => {
    const res = await request(app)
      .get('/api/vendors')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/vendors/:id - get vendor by id', async () => {
    const res = await request(app)
      .get(`/api/vendors/${testVendorId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testVendorId);
  });

  test('PUT /api/vendors/:id - update vendor', async () => {
    const res = await request(app)
      .put(`/api/vendors/${testVendorId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'vendorUpdate'});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'vendorUpdate');
  });

  test('GET /api/vendors?search=xxx - search vendor', async () => {
    const res = await request(app)
      .get('/api/vendors?search=vendor')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /api/vendors/:id - delete vendor', async () => {
    const res = await request(app)
      .delete(`/api/vendors/${testVendorId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/vendors/:id - vendor not found', async () => {
    const res = await request(app)
      .get(`/api/vendors/${testVendorId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Vendor not found');
  });
});
