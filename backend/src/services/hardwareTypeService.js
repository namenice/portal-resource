// src/services/hardwareTypeService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const HardwareTypeModel = require('../models/hardwareTypeModel');
const hardwareTypeModel = new HardwareTypeModel();


const hardwareTypeService = {
  async create({ name, description }) {
    if (!name) throw new BadRequestError('Hardware Type are required');
    return await hardwareTypeModel.create({ name, description });
  },

  async findAll(search) {
    if (search) {
      return await hardwareTypeModel.searchName(search);
    }
    return await hardwareTypeModel.findAll();
  },

  async findById(id) {
    const dataId = await hardwareTypeModel.findById(id);
    if (!dataId) throw new NotFoundError('Hardware Type not found');
    return dataId;
  },

  async update(id, fields) {
    const dataUpdate = await hardwareTypeModel.update(id, fields);
    if (!dataUpdate) throw new NotFoundError('Hardware Type not found');
    return dataUpdate;
  },

  async delete(id) {
    const dataDelete = await hardwareTypeModel.findById(id);
    if (!dataDelete) throw new NotFoundError('Hardware Type not found');
    await hardwareTypeModel.delete(id);
    return { message: 'Hardware Type deleted successfully' };
  }
};

module.exports = hardwareTypeService;
