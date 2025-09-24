// src/controllers/hardwareModelController.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const hardwareModelService = require('../services/hardwareModelService');

class hardwareModelController {
  async create(req, res, next) {
    try {
      const dataCreate = await hardwareModelService.create(req.body);
      res.status(201).json({ success: true, data: dataCreate });
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const { search } = req.query; 
      const dataAll = await hardwareModelService.findAll(search);
      res.json({ success: true, data: dataAll });
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const dataId = await hardwareModelService.findById(req.params.id);
      res.json({ success: true, data: dataId });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const dataUpdate = await hardwareModelService.update(req.params.id, req.body);
      res.json({ success: true, data: dataUpdate });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await hardwareModelService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
}

module.exports = new hardwareModelController();
