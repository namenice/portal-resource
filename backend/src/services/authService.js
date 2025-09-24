const { BadRequestError, UnauthorizedError } = require('../errors/customError');
const UserModel = require('../models/userModel');
const userModel = new UserModel();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

const authService = {
  async login({ username, password }) {
    if (!username || !password) throw new BadRequestError('Username and password required');

    const user = await userModel.findByUsername(username);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    return { token, user: { id: user.id, username: user.username } };
  }
};

module.exports = authService;

