// src/controllers/networkInterfaceController.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const networkInterfaceService = require('../services/networkInterfaceService');

class NetworkInterfaceController {
  // สร้าง network interface
  async create(req, res, next) {
    try {
      const dataCreate = await networkInterfaceService.create(req.body);
      res.status(201).json({ success: true, data: dataCreate });
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  // ดึง network interface ทั้งหมด
  async findAll(req, res, next) {
    try {
      const dataAll = await networkInterfaceService.findAll();
      res.json({ success: true, data: dataAll });
    } catch (err) {
      next(err);
    }
  }

  // ดึง network interface ตาม ID
  async findById(req, res, next) {
    try {
      const dataId = await networkInterfaceService.findById(req.params.id);
      res.json({ success: true, data: dataId });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  // อัปเดต network interface
  async update(req, res, next) {
    try {
      const dataUpdate = await networkInterfaceService.update(
        req.params.id,
        req.body
      );
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

  // ลบ network interface
  async delete(req, res, next) {
    try {
      const result = await networkInterfaceService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
}

module.exports = new NetworkInterfaceController();
