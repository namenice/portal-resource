// src/services/HardwareModelService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const HardwareModelModel = require('../models/hardwareModelModel');
const hardwareModelModel = new HardwareModelModel();

class hardwareModelService {
  async create(data) {
    const { brand, model, description } = data;
    if (!brand || !model) {
      throw new Error('Brand and Model are required');
    }
    const existing = await hardwareModelModel.findByBrandAndModel(brand, model);
    if (existing) {
      throw new Error(`Hardware Model Brand: ${brand} or Model: ${model} already exists`);
    }
    return await hardwareModelModel.create({ brand, model, description });
  }

  async findAll(search) {
    if (search) {
      return await hardwareModelModel.searchModels(search);
    }
    return await hardwareModelModel.findAll();
  }

  async findById(id) {
    const dataId = await hardwareModelModel.findById(id);
    if (!dataId) throw new NotFoundError(`Not found id=${id}`);
    return dataId;
  }

  async update(id, fields) {
    const dataUpdate = await hardwareModelModel.update(id, fields);
    if (!dataUpdate) throw new NotFoundError(`Hardware model not found`);
    return dataUpdate;
  }

  async delete(id) {
    const dataDelete = await hardwareModelModel.findById(id);
    if (!dataDelete) throw new NotFoundError(`Hardware model ${brand} ${model} not found`);
    await hardwareModelModel.delete(id);
    return { message: `Deleted Hardware Model id=${id} Successfully` };
  }
}

module.exports = new hardwareModelService();
