// src/services/hardwareService.js
const HardwareModel = require('../models/hardwareModel');
const { NotFoundError, BadRequestError } = require('../errors/customError');
const ExcelJS = require('exceljs');

const hardwareModel = new HardwareModel();

class HardwareService {
  // ====== CREATE ======
  async create(data) {
    try {
      const existingHardware = await hardwareModel.findByHostname(data.hostname);
      if (existingHardware) {
        throw new BadRequestError(`Hostname "${data.hostname}" already exists.`);
      }
      const created = await hardwareModel.createWithRelations(data);
      return created;
    } catch (err) {
        if (err instanceof BadRequestError) {
          throw err;
        }
      throw new BadRequestError(err.message);
    }
  }

  // ====== FIND ALL ======
  async findAll(search) {
    try {
      if (search) {
        // ค้นหาแบบ search term
        return await hardwareModel.searchHardware(search);
      }
      // ดึงทั้งหมดแบบ relations
      return await hardwareModel.findAllWithRelations();
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // ====== FIND BY ID ======
  async findById(id) {
    const data = await hardwareModel.findByIdWithRelations(id);
    if (!data) throw new NotFoundError(`Hardware with ID ${id} not found`);
    return data;
  }

  // ====== UPDATE ======
  async update(id, fields) {
    try {
      const updated = await hardwareModel.updateWithRelations(id, fields);
      if (!updated) throw new NotFoundError(`Hardware with ID ${id} not found`);
      return updated;
    } catch (err) {
      if (err.message.includes('Unit range overlaps')) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  // ====== DELETE ======
  async delete(id) {
    const deleted = await hardwareModel.deleteWithRelations(id);
    if (!deleted) throw new NotFoundError(`Hardware with ID ${id} not found`);
    return deleted;
  }

  // ====== FIND BY HOSTNAME ======
  async findByHostname(hostname) {
    const data = await hardwareModel.findByHostname(hostname);
    if (!data) throw new NotFoundError(`Hardware with hostname "${hostname}" not found`);
    return data;
  }

  // ====== FIND BY CLUSTER ======
  async findByCluster(cluster_id) {
    const data = await hardwareModel.findByCluster(cluster_id);
    return data;
  }

  // ====== FIND BY LOCATION ======
  async findByLocation(location_id) {
    const data = await hardwareModel.findByLocation(location_id);
    return data;
  }

  // ====== FIND BY RACK ======
  async findByRack(rack_id) {
    // ถ้า rack_id คือชื่อ rack, ต้อง query via location
    const data = await hardwareModel.findAllWithRelations({
      where: { 'l.rack': rack_id }
    });
    return data;
  }

  // ====== FIND WITH FULL RELATIONS ======
  async findWithRelations(id) {
    const data = await hardwareModel.findByIdWithRelations(id);
    if (!data) throw new NotFoundError(`Hardware with ID ${id} not found`);
    return data;
  }
  // ====== EXPORT TO EXCEL ======
  async exportToExcel() {
    try {
      return await hardwareModel.exportToExcel();
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

}

module.exports = new HardwareService();
