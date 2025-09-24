// src/models/baseModel.js
const logger = require('../utils/logger');

class BaseModel {
  constructor(tableName, idColumn = 'id') {
    if (!tableName) {
      throw new Error('Table name is required');
    }
    this.tableName = tableName;
    this.idColumn = idColumn;
    this.fillableColumns = []; // เพิ่ม whitelist สำหรับ columns ที่อนุญาตให้แก้ไข
  }

  get pool() {
    const { getPool } = require('../config/database');
    const pool = getPool();
    if (!pool) throw new Error('Database not initialized. Call connectDB() first.');
    return pool;
  }

  // ปรับปรุง validation และ security
  _validateFields(fields) {
    if (!fields || typeof fields !== 'object') {
      throw new Error('Fields must be a valid object');
    }
    
    const keys = Object.keys(fields);
    if (keys.length === 0) {
      throw new Error('At least one field is required');
    }

    // ตรวจสอบ SQL injection โดยเบื้องต้น
    const dangerousPatterns = /('|"|;|--|\*|\/\*|\*\/|xp_|sp_)/i;
    keys.forEach(key => {
      if (dangerousPatterns.test(key)) {
        throw new Error(`Invalid column name: ${key}`);
      }
    });

    return true;
  }

  // เพิ่ม method สำหรับ filter เฉพาะ columns ที่อนุญาต
  _filterFillableFields(fields) {
    if (this.fillableColumns.length === 0) {
      return fields; // ถ้าไม่กำหนด fillable ให้ใช้ทั้งหมด
    }
    
    const filtered = {};
    Object.keys(fields).forEach(key => {
      if (this.fillableColumns.includes(key)) {
        filtered[key] = fields[key];
      }
    });
    
    return filtered;
  }

  // Create 
  async create(fields) {
    try {
      this._validateFields(fields);
      const filteredFields = this._filterFillableFields(fields);
      
      if (Object.keys(filteredFields).length === 0) {
        throw new Error('No valid fields provided for creation');
      }

      const keys = Object.keys(filteredFields);
      const values = Object.values(filteredFields);
      const placeholders = keys.map(() => '?').join(', ');
      
      const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const [result] = await this.pool.query(sql, values);
      
      return this.findById(result.insertId);
    } catch (err) {
      logger.error(`Error in ${this.tableName}.create:`, err);
      throw err;
    }
  }

  // เพิ่ม pagination support
  async findAll(options = {}) {
    try {
      const { 
        limit = null, 
        offset = 0, 
        orderBy = null, 
        orderDirection = 'ASC',
        where = null 
      } = options;

      let sql = `SELECT * FROM ${this.tableName}`;
      const params = [];

      // เพิ่ม WHERE clause
      if (where) {
        const whereConditions = [];
        Object.keys(where).forEach(key => {
          whereConditions.push(`${key} = ?`);
          params.push(where[key]);
        });
        sql += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      // เพิ่ม ORDER BY
      if (orderBy) {
        const direction = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) 
          ? orderDirection.toUpperCase() 
          : 'ASC';
        sql += ` ORDER BY ${orderBy} ${direction}`;
      }

      // เพิ่ม LIMIT และ OFFSET
      if (limit) {
        sql += ` LIMIT ?`;
        params.push(limit);
        
        if (offset > 0) {
          sql += ` OFFSET ?`;
          params.push(offset);
        }
      }

      const [rows] = await this.pool.query(sql, params);
      return rows;
    } catch (err) {
      logger.error(`Error in ${this.tableName}.findAll:`, err);
      throw err;
    }
  }

  async findById(id) {
    try {
      if (!id) {
        throw new Error('ID is required');
      }

      const [rows] = await this.pool.query(
        `SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (err) {
      logger.error(`Error in ${this.tableName}.findById:`, err);
      throw err;
    }
  }

  async update(id, fields) {
    try {
      if (!id) {
        throw new Error('ID is required for update');
      }
      
      this._validateFields(fields);
      const filteredFields = this._filterFillableFields(fields);
      
      const keys = Object.keys(filteredFields);
      if (keys.length === 0) {
        throw new Error('No valid fields provided for update');
      }

      const values = Object.values(filteredFields);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.idColumn} = ?`;
      
      const [result] = await this.pool.query(sql, [...values, id]);
      
      // ตรวจสอบว่ามีการอัพเดทจริงหรือไม่
      if (result.affectedRows === 0) {
        return null; // ไม่พบ record ที่ต้องการอัพเดท
      }
      
      return this.findById(id);
    } catch (err) {
      logger.error(`Error in ${this.tableName}.update:`, err);
      throw err;
    }
  }

  async delete(id) {
    try {
      if (!id) {
        throw new Error('ID is required for deletion');
      }

      const [result] = await this.pool.query(
        `DELETE FROM ${this.tableName} WHERE ${this.idColumn} = ?`,
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (err) {
      logger.error(`Error in ${this.tableName}.delete:`, err);
      throw err;
    }
  }

  // ปรับปรุง search ให้ปลอดภัยและยืดหยุ่นมากขึ้น
  async search(term, columns = [], options = {}) {
    try {
      if (!term) {
        throw new Error('Search term is required');
      }

      const { 
        limit = null, 
        offset = 0,
        exact = false // เพิ่ม option สำหรับค้นหาแบบตรงเป๊ะ
      } = options;

      if (columns.length === 0) {
        throw new Error('Search columns must be specified');
      }

      // ตรวจสอบ column names
      columns.forEach(col => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) {
          throw new Error(`Invalid column name: ${col}`);
        }
      });

      const searchTerm = exact ? term : `%${term}%`;
      const operator = exact ? '=' : 'LIKE';
      const whereClause = columns.map(col => `${col} ${operator} ?`).join(' OR ');
      const params = columns.map(() => searchTerm);

      let sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;

      if (limit) {
        sql += ` LIMIT ?`;
        params.push(limit);
        
        if (offset > 0) {
          sql += ` OFFSET ?`;
          params.push(offset);
        }
      }

      const [rows] = await this.pool.query(sql, params);
      return rows;
    } catch (err) {
      logger.error(`Error in ${this.tableName}.search:`, err);
      throw err;
    }
  }

  async findByColumn(value, column = 'name') {
    try {
      if (!value) {
        throw new Error('Value is required');
      }

      // ตรวจสอบ column name
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
        throw new Error(`Invalid column name: ${column}`);
      }

      const [rows] = await this.pool.query(
        `SELECT * FROM ${this.tableName} WHERE ${column} = ?`,
        [value]
      );
      return rows[0] || null;
    } catch (err) {
      logger.error(`Error in ${this.tableName}.findByColumn:`, err);
      throw err;
    }
  }

  // เพิ่ม method ใหม่ที่มีประโยชน์
  async count(where = null) {
    try {
      let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      const params = [];

      if (where) {
        const whereConditions = [];
        Object.keys(where).forEach(key => {
          whereConditions.push(`${key} = ?`);
          params.push(where[key]);
        });
        sql += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      const [rows] = await this.pool.query(sql, params);
      return rows[0].total;
    } catch (err) {
      logger.error(`Error in ${this.tableName}.count:`, err);
      throw err;
    }
  }

  async exists(id) {
    try {
      const count = await this.count({ [this.idColumn]: id });
      return count > 0;
    } catch (err) {
      logger.error(`Error in ${this.tableName}.exists:`, err);
      throw err;
    }
  }

  // Batch operations
  async createMany(recordsArray) {
    if (!Array.isArray(recordsArray) || recordsArray.length === 0) {
      throw new Error('Records array is required and cannot be empty');
    }

    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const record of recordsArray) {
        const result = await this.create(record);
        results.push(result);
      }
      
      await connection.commit();
      return results;
    } catch (err) {
      await connection.rollback();
      logger.error(`Error in ${this.tableName}.createMany:`, err);
      throw err;
    } finally {
      connection.release();
    }
  }

  async deleteMany(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('IDs array is required and cannot be empty');
    }

    try {
      const placeholders = ids.map(() => '?').join(', ');
      const [result] = await this.pool.query(
        `DELETE FROM ${this.tableName} WHERE ${this.idColumn} IN (${placeholders})`,
        ids
      );
      
      return result.affectedRows;
    } catch (err) {
      logger.error(`Error in ${this.tableName}.deleteMany:`, err);
      throw err;
    }
  }
}

module.exports = BaseModel;