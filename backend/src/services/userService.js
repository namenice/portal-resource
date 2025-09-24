// src/services/userService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const UserModel = require('../models/userModel');
const userModel = new UserModel();
const bcrypt = require('bcrypt');


const saltRounds = 10;

const userService = {
  async create({ username, password }) {
    if (!username || !password) throw new BadRequestError('Username and password are required');

    // check duplicate
    const existing = await userModel.findByUsername(username);
    if (existing) throw new BadRequestError('Username already exists');

    const password_hash = await bcrypt.hash(password, saltRounds);
    const newUser = await userModel.create({ username, password_hash });
    return newUser;
  },

  async findAll(search) {
    let users;
    if (search) {
      users = await userModel.searchUsers(search);
    } else {
      users = await userModel.findAll();
    }
    // ลบ password hash ก่อน return
    return users.map(({ password_hash, ...u }) => u);
  },

  async findById(id) {
    const user = await userModel.findById(id);
    if (!user) throw new NotFoundError('User not found');
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async update(id, fields) {
    if (fields.password) {
      fields.password_hash = await bcrypt.hash(fields.password, saltRounds);
      delete fields.password; // ลบ password ธรรมดาออก
    }

    const updatedUser = await userModel.update(id, fields);
    if (!updatedUser) throw new NotFoundError('User not found');

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  async delete(id) {
    const exists = await userModel.exists(id);
    if (!exists) throw new NotFoundError('User not found');

    await userModel.delete(id);
    return { message: 'User deleted successfully' };
  }
};

module.exports = userService;
