// src/controllers/authController.js
const authService = require('../services/authService');

const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
