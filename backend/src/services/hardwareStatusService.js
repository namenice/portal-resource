// src/services/hardwareStatusService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const HardwareStatusModel = require('../models/hardwareStatusModel');
const hardwareStatusModel = new HardwareStatusModel();

const hardwareStatusService = {
  async create({ name, description }) {
    if (!name) throw new BadRequestError('Hardware Status are required');
    return await hardwareStatusModel.create({ name, description });
  },

  async findAll(search) {
    if (search) {
      return await hardwareStatusModel.searchName(search);
    }
    return await hardwareStatusModel.findAll();
  },

  async findById(id) {
    const dataId = await hardwareStatusModel.findById(id);
    if (!dataId) throw new NotFoundError('Hardware Status not found');
    return dataId;
  },

  async update(id, fields) {
    const updated = await hardwareStatusModel.update(id, fields);
    if (!updated) throw new NotFoundError('Hardware Status not found');
    return updated;
  },

  async delete(id) {
    const dataDelete = await hardwareStatusModel.findById(id);
    if (!dataDelete) throw new NotFoundError('Hardware Status not found');
    await hardwareStatusModel.delete(id);
    return { message: 'Hardware Status deleted successfully' };
  }
};

module.exports = hardwareStatusService;
