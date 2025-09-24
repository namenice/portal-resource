const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/customError');
const config = require('../config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // เพิ่ม user info ให้ request
    next();
  } catch (err) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

module.exports = authMiddleware;
