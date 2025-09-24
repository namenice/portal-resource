// src/controllers/hardwareController.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const hardwareService = require('../services/hardwareService');

class HardwareController {
  // ====== CREATE ======
  async create(req, res, next) {
    try {
      const dataCreate = await hardwareService.create(req.body);
      res.status(201).json({ success: true, data: dataCreate });
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  // ====== FIND ALL ======
  async findAll(req, res, next) {
    try {
      const { search } = req.query;
      const dataAll = await hardwareService.findAll(search);
      res.json({ success: true, data: dataAll });
    } catch (err) {
      next(err);
    }
  }

  // ====== FIND BY ID ======
  async findById(req, res, next) {
    try {
      const dataId = await hardwareService.findById(req.params.id);
      res.json({ success: true, data: dataId });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  // ====== UPDATE ======
  async update(req, res, next) {
    try {
      const dataUpdate = await hardwareService.update(req.params.id, req.body);
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

  // ====== DELETE ======
  async delete(req, res, next) {
    try {
      const result = await hardwareService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  // ====== SEARCH / FILTER / RELATIONS ======
  async findByHostname(req, res, next) {
    try {
      const data = await hardwareService.findByHostname(req.params.hostname);
      res.json({ success: true, data });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async findByCluster(req, res, next) {
    try {
      const data = await hardwareService.findByCluster(req.params.cluster_id);
      res.json({ success: true, data });
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async findByLocation(req, res, next) {
    try {
      const data = await hardwareService.findByLocation(req.params.location_id);
      res.json({ success: true, data });
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async findByRack(req, res, next) {
    try {
      const data = await hardwareService.findByRack(req.params.rack_id);
      res.json({ success: true, data });
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async findWithRelations(req, res, next) {
    try {
      const data = await hardwareService.findWithRelations(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
  // ====== EXPORT TO EXCEL ======
  async exportToExcel(req, res, next) {
    try {
      const buffer = await hardwareService.exportToExcel();

      const fileName = `hardware-report-${Date.now()}.xlsx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      res.send(buffer);
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

}

module.exports = new HardwareController();
