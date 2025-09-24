// src/services/vendorService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const VendorModel = require('../models/vendorModel');
const vendorModel = new VendorModel();

const vendorService = {
  async create({ name }) {
    if (!name) throw new BadRequestError('Vendor Name are required');
    return await vendorModel.create({ name });
  },

  async findAll(search) {
    if (search) {
      return await vendorModel.searchName(search);
    }
    return await vendorModel.findAll();
  },

  async findById(id) {
    const dataId = await vendorModel.findById(id);
    if (!dataId) throw new NotFoundError('Vendor not found');
    return dataId;
  },

  async update(id, fields) {
    const dataUpdate = await vendorModel.update(id, fields);
    if (!dataUpdate) throw new NotFoundError('Vendor not found');
    return dataUpdate;
  },

  async delete(id) {
    const dataDelete = await vendorModel.findById(id);
    if (!dataDelete) throw new NotFoundError('Vendor not found');
    await vendorModel.delete(id);
    return { message: 'Vendor deleted successfully' };
  }
};

module.exports = vendorService;
