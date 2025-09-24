// src/controllers/userController.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const userService = require('../services/userService');

const userController = {
  async create(req, res, next) {
    try {
      const newUser = await userService.create(req.body);
      res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async findAll(req, res, next) {
    try {
      const { search } = req.query;
      const users = await userService.findAll(search);
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  },

  async findById(req, res, next) {
    try {
      const user = await userService.findById(req.params.id);
      res.json({ success: true, data: user });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updatedUser = await userService.update(req.params.id, req.body);
      res.json({ success: true, data: updatedUser });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err instanceof BadRequestError) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await userService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
};

module.exports = userController;
