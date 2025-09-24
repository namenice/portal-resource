// src/utils/logger.js
// const winston = require('winston');
// const config = require('../config');

// const logger = winston.createLogger({
//   level: config.logging.level,
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.errors({ stack: true }),
//     winston.format.json()
//   ),
//   defaultMeta: { service: 'hardware-api' },
//   transports: [
//     new winston.transports.File({ 
//       filename: 'logs/error.log', 
//       level: 'error',
//       maxsize: 5242880, // 5MB
//       maxFiles: 5
//     }),
//     new winston.transports.File({ 
//       filename: 'logs/combined.log',
//       maxsize: 5242880, // 5MB
//       maxFiles: 5
//     })
//   ]
// });

// // Add console transport for non-production environments
// if (config.env !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.simple()
//     )
//   }));
// }

// module.exports = logger;

const config = require('../config');

const logger = {
  info: (message, meta) => {
    if (config.env !== 'production') {
      console.log(`INFO: ${message}`, meta || '');
    }
  },
  error: (message, meta) => {
    if (config.env !== 'production') {
      console.error(`ERROR: ${message}`, meta || '');
    }
  },
  debug: (message, meta) => {
    if (config.env !== 'production') {
      console.debug(`DEBUG: ${message}`, meta || '');
    }
  }
};

module.exports = logger;
