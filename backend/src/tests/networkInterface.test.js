// src/tests/networkInterface.test.js
const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const { connectDB, closeDB } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api', routes);

let testHardwareId;
let testInterfaceId;
let token;

const createdHardware = [];
const createdInterfaces = [];
const createdUsers = [];

beforeAll(async () => {
  await connectDB();

  // === สร้าง user และ login ===
  const userRes = await request(app)
    .post('/api/users')
    .send({ username: 'testuser_iface', password: '123456' });
  if (userRes.body.data?.id) createdUsers.push(userRes.body.data.id);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testuser_iface', password: '123456' });
  token = loginRes.body.data.token;

  // === สร้าง hardware สำหรับทดสอบ network interface ===
  const hardwareRes = await request(app)
    .post('/api/hardwares')
    .set('Authorization', `Bearer ${token}`)
    .send({
      hostname: 'test-hw-iface',
      status_id: 1,
      type_id: 1,
      model_id: 1,
      owner: 'tester',
      location_id: 1,
      unit_range: 'U39'
    });

  testHardwareId = hardwareRes.body.data.id;
  createdHardware.push(testHardwareId);
});

afterAll(async () => {
  // ลบ network interfaces
  for (const id of createdInterfaces) {
    await request(app)
      .delete(`/api/networkinterfaces/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  // ลบ hardware
  for (const id of createdHardware) {
    await request(app)
      .delete(`/api/hardwares/${id}`)
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

describe('NetworkInterface API', () => {
  // ======= Create =======
  test('POST /api/networkinterfaces - Create', async () => {
    const res = await request(app)
      .post('/api/networkinterfaces')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hardware_id: testHardwareId,
        interface_name: 'eth0',
        ip_address: '192.168.1.10',
        netmask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac_address: 'AA:BB:CC:DD:EE:FF',
        vlan: '1',
        is_primary: true
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    testInterfaceId = res.body.data.id;
    createdInterfaces.push(testInterfaceId);
  });

  // ======= Duplicate interface_name on same hardware should fail =======
  test('POST /api/networkinterfaces - Duplicate Interface should fail', async () => {
    const res = await request(app)
      .post('/api/networkinterfaces')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hardware_id: testHardwareId,
        interface_name: 'eth0', // same name
        ip_address: '192.168.1.11'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // ======= Get All =======
  test('GET /api/networkinterfaces - Get All', async () => {
    const res = await request(app)
      .get('/api/networkinterfaces')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ======= Get By ID =======
  test('GET /api/networkinterfaces/:id - Get By ID', async () => {
    const res = await request(app)
      .get(`/api/networkinterfaces/${testInterfaceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', testInterfaceId);
  });

  // ======= Update =======
  test('PUT /api/networkinterfaces/:id - Update', async () => {
    const res = await request(app)
      .put(`/api/networkinterfaces/${testInterfaceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ip_address: '192.168.1.20',
        vlan: '2'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('ip_address', '192.168.1.20');
    expect(res.body.data).toHaveProperty('vlan', '2');
  });

  // ======= Delete =======
  test('DELETE /api/networkinterfaces/:id - Delete', async () => {
    const res = await request(app)
      .delete(`/api/networkinterfaces/${testInterfaceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ======= Not Found =======
  test('GET /api/networkinterfaces/:id - Not Found', async () => {
    const res = await request(app)
      .get(`/api/networkinterfaces/${testInterfaceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`NetworkInterface ID ${testInterfaceId} not found`);
  });
});
