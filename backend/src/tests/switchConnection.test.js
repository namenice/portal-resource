// src/tests/switchConnection.test.js
const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const { connectDB, closeDB } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api', routes);

let testSwitchId;
let testHardwareId;
let testConnectionId;
let token;

const createdSwitches = [];
const createdHardware = [];
const createdConnections = [];
const createdUsers = [];

beforeAll(async () => {
  await connectDB();

  // === สร้าง user และ login ===
  const userRes = await request(app)
    .post('/api/users')
    .send({ username: 'testuser_conn', password: '123456' });
  if (userRes.body.data?.id) createdUsers.push(userRes.body.data.id);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testuser_conn', password: '123456' });
  token = loginRes.body.data.token;

  // === สร้าง switch ===
  const switchRes = await request(app)
    .post('/api/switches')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'test-switch-conn',
      model_id: 1,
      vendor_id: 1,
      location_id: 1,
      ip_mgmt: '192.168.100.1'
    });

  testSwitchId = switchRes.body.data.id;
  createdSwitches.push(testSwitchId);
  console.log('testSwitchId', testSwitchId)

  // === สร้าง hardware ===
  const hardwareRes = await request(app)
    .post('/api/hardwares')
    .set('Authorization', `Bearer ${token}`)
    .send({
      hostname: 'test-hw-conn',
      status_id: 1,
      type_id: 1,
      model_id: 1,
      owner: 'tester',
      location_id: 1,
      unit_range: 'U1'
    });

  testHardwareId = hardwareRes.body.data.id;
  createdHardware.push(testHardwareId);
  console.log('testHardwareId', testHardwareId)

});

afterAll(async () => {
  // ลบ connection
  for (const id of createdConnections) {
    await request(app)
      .delete(`/api/switchconnections/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  // ลบ switch
  for (const id of createdSwitches) {
    await request(app)
      .delete(`/api/switches/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  // ลบ hardware
  for (const id of createdHardware) {
    await request(app)
      .delete(`/api/hardware/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  // ลบ user
  for (const id of createdUsers) {
    await request(app)
      .delete(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  await closeDB();
});

describe('SwitchConnection API', () => {
  // ======= Create =======
  test('POST /api/switchconnections - Create', async () => {
    const res = await request(app)
      .post('/api/switchconnections')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hardware_id: testHardwareId,
        switch_id: testSwitchId,
        port: 'Gi0/1'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testConnectionId = res.body.data.id;
    createdConnections.push(testConnectionId);
  });

  // ======= Duplicate Port =======
  test('POST /api/switchconnections - Duplicate Port should fail', async () => {
    const res = await request(app)
      .post('/api/switchconnections')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hardware_id: testHardwareId,
        switch_id: testSwitchId,
        port: 'Gi0/1'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ======= Get All =======
  test('GET /api/switchconnections - Get All', async () => {
    const res = await request(app)
      .get('/api/switchconnections')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Get By ID =======
  test('GET /api/switchconnections/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/switchconnections/${testConnectionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testConnectionId);
  });

  // ======= Update =======
  test('PUT /api/switchconnections/:id - Update Port', async () => {
    const res = await request(app)
      .put(`/api/switchconnections/${testConnectionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ port: 'Gi0/2', switch_id: testSwitchId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('port', 'Gi0/2');
  });

  // ======= Delete =======
  test('DELETE /api/switchconnections/:id - Delete', async () => {
    const res = await request(app)
      .delete(`/api/switchconnections/${testConnectionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ======= Not Found =======
  test('GET /api/switchconnections/:id - Not Found', async () => {
    const res = await request(app)
      .get(`/api/switchconnections/${testConnectionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`SwitchConnection ID ${testConnectionId} not found`);
  });
});
