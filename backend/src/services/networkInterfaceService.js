// src/services/networkInterfaceService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const NetworkInterfaceModel = require('../models/networkInterfaceModel');
const networkInterfaceModel = new NetworkInterfaceModel();

class NetworkInterfaceService {
  // สร้าง network interface ใหม่
  async create(data) {
    const { hardware_id, interface_name } = data;

    if (!hardware_id || !interface_name) {
      throw new BadRequestError('hardware_id and interface_name are required');
    }

    // ตรวจสอบ duplicate (hardware_id + interface_name)
    const existing = await networkInterfaceModel.findByHardwareAndName(hardware_id, interface_name);
    if (existing) {
      throw new BadRequestError(
        `Interface "${interface_name}" already exists for hardware_id ${hardware_id}`
      );
    }

    return await networkInterfaceModel.create(data);
  }

  // ดึง network interface ทั้งหมด
  async findAll() {
    return await networkInterfaceModel.findAll();
  }

  // ดึง network interface ตาม ID
  async findById(id) {
    const data = await networkInterfaceModel.findById(id);
    if (!data) throw new NotFoundError(`NetworkInterface ID ${id} not found`);
    return data;
  }

  // อัปเดต network interface
  async update(id, fields) {
    if (fields.hardware_id && fields.interface_name) {
      const dup = await networkInterfaceModel.findByHardwareAndName(
        fields.hardware_id,
        fields.interface_name
      );
      if (dup && dup.id !== parseInt(id, 10)) {
        throw new BadRequestError(
          `Interface "${fields.interface_name}" already exists for hardware_id ${fields.hardware_id}`
        );
      }
    }

    const updated = await networkInterfaceModel.update(id, fields);
    if (!updated) throw new NotFoundError(`NetworkInterface ID ${id} not found`);
    return updated;
  }

  // ลบ network interface
  async delete(id) {
    const existing = await networkInterfaceModel.findById(id);
    if (!existing) throw new NotFoundError(`NetworkInterface ID ${id} not found`);
    await networkInterfaceModel.delete(id);
    return { message: `Deleted NetworkInterface ID ${id} Successfully` };
  }
}

module.exports = new NetworkInterfaceService();
