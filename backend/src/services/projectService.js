// src/services/projectService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const ProjectsModel = require('../models/projectModel');
const projectModel = new ProjectsModel();

class projectService {
  async create(data) {
    const { name, owner, description } = data;
    if (!name || !owner) {
      throw new Error('Name and Owner are required');
    }
    const existing = await projectModel.findByColumn(name);
    if (existing) {
      throw new Error(`Project Name ${name} already exists`);
    }
    return await projectModel.create({ name, owner, description });
  }

  async findAll(search) {
    if (search) {
      return await projectModel.searchPorject(search);
    }
    return await projectModel.findAll();
  }

  async findById(id) {
    const dataId = await projectModel.findById(id);
    if (!dataId) throw new NotFoundError(`Not found id=${id}`);
    return dataId;
  }

  async update(id, fields) {
    const dataUpdate = await projectModel.update(id, fields);
    if (!dataUpdate) throw new NotFoundError(`Project not found`);
    return dataUpdate;
  }

  async delete(id) {
    const dataDelete = await projectModel.findById(id);
    if (!dataDelete) throw new NotFoundError(`Project ID ${id} not found`);
    await projectModel.delete(id);
    return { message: `Deleted Project ID ${id} Successfully` };
  }
}

module.exports = new projectService();
