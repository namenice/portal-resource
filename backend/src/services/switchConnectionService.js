// src/services/switchConnectionService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const SwitchConnectionModel = require('../models/switchConnectionModel');
const switchConnectionModel = new SwitchConnectionModel();

class switchConnectionService {
  async create(data) {
    const { hardware_id, switch_id, port } = data;

    if (!hardware_id || !switch_id || !port) {
      throw new BadRequestError('hardware_id, switch_id, and port are required');
    }

    // ตรวจสอบว่า port ซ้ำหรือไม่ (switch_id + port ต้อง unique)
    const existing = await switchConnectionModel.findBySwitchPort(switch_id, port);
    if (existing) {
      throw new BadRequestError(`Port "${port}" on switch_id ${switch_id} is already in use`);
    }
    
    return await switchConnectionModel.create(data);
  }

  async findAll() {
    return await switchConnectionModel.findAll();
  }

  async findById(id) {
    const data = await switchConnectionModel.findById(id);
    if (!data) throw new NotFoundError(`SwitchConnection ID ${id} not found`);
    return data;
  }

  async update(id, fields) {
    // ตรวจสอบ duplicate port ถ้ามีการแก้ไข port หรือ switch_id
    if (fields.switch_id && fields.port) {
      const dup = await switchConnectionModel.findBySwitchPort(fields.switch_id, fields.port);
      if (dup && dup.id !== parseInt(id, 10)) {
        throw new BadRequestError(`Port "${fields.port}" on switch_id ${fields.switch_id} is already in use`);
      }
    }

    const updated = await switchConnectionModel.update(id, fields);
    if (!updated) throw new NotFoundError(`SwitchConnection ID ${id} not found`);
    return updated;
  }

  async delete(id) {
    const existing = await switchConnectionModel.findById(id);
    if (!existing) throw new NotFoundError(`SwitchConnection ID ${id} not found`);
    await switchConnectionModel.delete(id);
    return { message: `Deleted SwitchConnection ID ${id} Successfully` };
  }

}

module.exports = new switchConnectionService();
