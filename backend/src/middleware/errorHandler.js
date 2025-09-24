// src/middleware/errorHandler.js
const logger = require('../utils/logger');
// const { AppError } = require('../errors/customError');


function errorHandler(err, req, res, next) {
  // logger.error(err); // เก็บ log ไว้ก่อน
    logger.error('Error:', {
    message: err.message,
    // stack: err.stack,
  });

  // กรณี MySQL error
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY': // unique constraint fail
        return res.status(400).json({
          success: false,
          message: 'Duplicate entry',
          details: err.sqlMessage
        });

      case 'ER_NO_REFERENCED_ROW_2': // foreign key constraint fail
      case 'ER_ROW_IS_REFERENCED_2':
        return res.status(400).json({
          success: false,
          message: 'Foreign key constraint failed',
          details: err.sqlMessage
        });

      default:
        return res.status(500).json({
          success: false,
          message: 'Database error',
          details: err.sqlMessage
        });
    }
  }

  // Error ปกติ (เช่น custom error จาก service/controller)
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
