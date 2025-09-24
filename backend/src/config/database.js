// src/config/database.js
const mysql = require('mysql2/promise');
const config = require('./index');
const logger = require('../utils/logger');

let pool = null;

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return pool;
};

const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      port: config.database.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // acquireTimeout: 60000,
      // timeout: 60000,
    });

    // Test connection
    const connection = await pool.getConnection();
    logger.info(`Connected to MariaDB database: ${config.database.name}`);
    connection.release();

    // Handle pool errors
    pool.on('error', (err) => {
      logger.error('MariaDB Pool Error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        logger.info('Attempting to reconnect...');
        setTimeout(connectDB, 2000);
      } else {
        throw err;
      }
    });

    return pool;
  } catch (err) {
    logger.error('Failed to connect to MariaDB:', err);
    throw err;
  }
};

const closeDB = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection closed');
  }
};

module.exports = {
  connectDB,
  getPool,
  closeDB
};