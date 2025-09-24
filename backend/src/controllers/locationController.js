// src/controllers/locationController.jsx
const locationService = require('../services/locationService');
const logger = require('../utils/logger');

class LocationController {
  
  async create(req, res, next) {
    try {
      const dataCreate = await locationService.create(req.body);
      res.status(201).json({ success: true, data: dataCreate });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const { search, includeSiteNames } = req.query; 

      // สร้าง options object เพื่อส่งต่อไปยัง service
      const options = {
          search,
          includeSiteNames: includeSiteNames === 'true'
      };

      const dataAll = await locationService.findAll(options);
      res.json({ success: true, data: dataAll });
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const dataId = await locationService.findById(req.params.id);
      res.json({ success: true, data: dataId });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const dataUpdate = await locationService.update(req.params.id, req.body);
      res.json({ success: true, data: dataUpdate });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await locationService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async findByRoomAndRack(req, res, next) {
    try {
      const { siteId, room, rack } = req.query;
      const data = await locationService.findByRoomAndRack(siteId, room, rack);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LocationController();