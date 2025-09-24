// src/services/siteService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const SiteModel = require('../models/siteModel');
const siteModel = new SiteModel();


const siteService = {
  async create({ name }) {
    if (!name) throw new BadRequestError('Site are required');
    return await siteModel.create({ name });
  },

  async findAll(search) {
    if (search) {
      return await siteModel.searchName(search);
    }
    return await siteModel.findAll();
  },

  async findById(id) {
    const dataId = await siteModel.findById(id);
    if (!dataId) throw new NotFoundError('Site not found');
    return dataId;
  },

  async update(id, fields) {
    const updated = await siteModel.update(id, fields);
    if (!updated) throw new NotFoundError('Site not found');
    return updated;
  },

  async delete(id) {
    const dataDelete = await siteModel.findById(id);
    if (!dataDelete) throw new NotFoundError('Site not found');
    await siteModel.delete(id);
    return { message: 'Site deleted successfully' };
  }
};

module.exports = siteService;
