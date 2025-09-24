// src/controllers/switchController.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const switchService = require('../services/switchService');

class SwitchController {
  async create(req, res, next) {
    try {
      const dataCreate = await switchService.create(req.body);
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
      const dataAll = await switchService.findAll(search);
      res.json({ success: true, data: dataAll });
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const dataId = await switchService.findById(req.params.id);
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
      const dataUpdate = await switchService.update(req.params.id, req.body);
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
      const result = await switchService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async findConnectedHardware(req, res, next) {
    try {
      const switch_id = req.params.id;
      const data = await switchService.findConnectedHardware(switch_id);
      res.json({ success: true, data });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
}

module.exports = new SwitchController();