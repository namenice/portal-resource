// src/tests/switch.test.js
const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const { connectDB, closeDB } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api', routes);

let testSwitchId;
let testHardwareId;
let token;

const createdSwitches = [];
const createdUsers = [];
const createdHardware = [];

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

  // สร้าง hardware สำหรับทดสอบ switch connection
  const hardwareRes = await request(app)
    .post('/api/hardware')
    .set('Authorization', `Bearer ${token}`)
    .send({
      hostname: 'test-host1',
      status_id: 1,
      type_id: 1,
      model_id: 1,
      owner: 'test-owner',
      location_id: 1,
      unit_range: 'U1'
    });

  if (hardwareRes.body.data?.id) {
    testHardwareId = hardwareRes.body.data.id;
    createdHardware.push(testHardwareId);
  }
});

afterAll(async () => {
  // ลบ switch ที่สร้างระหว่าง test
  for (const id of createdSwitches) {
    await request(app)
      .delete(`/api/switches/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  // ลบ hardware ที่สร้างระหว่าง test
  for (const id of createdHardware) {
    await request(app)
      .delete(`/api/hardware/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  // ลบ user ที่สร้างระหว่าง test
  for (const id of createdUsers) {
    await request(app)
      .delete(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  await closeDB();
});

describe('Switch API', () => {
  // ======= Create =======
  test('POST /api/switches - Create', async () => {
    const res = await request(app)
      .post('/api/switches')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'test-switch1',
        model_id: 1,
        vendor_id: 1,
        location_id: 1,
        ip_mgmt: '192.168.0.10'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testSwitchId = res.body.data.id;
    createdSwitches.push(testSwitchId);
  });

  // ======= Get All =======
  test('GET /api/switches - Get All', async () => {
    const res = await request(app)
      .get('/api/switches')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Get By ID =======
  test('GET /api/switches/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/switches/${testSwitchId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testSwitchId);
  });

  // ======= Update =======
  test('PUT /api/switches/:id - Update', async () => {
    const res = await request(app)
      .put(`/api/switches/${testSwitchId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'test-switch1-updated',
        ip_mgmt: '192.168.0.11'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'test-switch1-updated');
    expect(res.body.data).toHaveProperty('ip_mgmt', '192.168.0.11');
  });

  // ======= Search =======
  test('GET /api/switches?search=updated - Search', async () => {
    const res = await request(app)
      .get('/api/switches?search=updated')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Connected Hardware =======
  test('GET /api/switches/:id/hardware - Get Connected Hardware', async () => {
    // เชื่อมต่อ hardware กับ switch ก่อน
    const res = await request(app)
      .get(`/api/switches/${testSwitchId}/hardware`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Delete =======
  test('DELETE /api/switches/:id - Delete', async () => {
    const res = await request(app)
      .delete(`/api/switches/${testSwitchId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ======= Not Found =======
  test('GET /api/switches/:id - Not Found', async () => {
    const res = await request(app)
      .get(`/api/switches/${testSwitchId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`Not found id=${testSwitchId}`);
  });
});
