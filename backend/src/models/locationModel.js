// src/models/locationModel.jsx
const BaseModel = require('./baseModel');

class LocationModel extends BaseModel {
  /**
   * สร้าง instance ของ LocationModel
   */
  constructor() {
    super('locations'); // กำหนดชื่อตารางเป็น 'locations'
    // กำหนดคอลัมน์ที่อนุญาตให้แก้ไขเพื่อเพิ่มความปลอดภัย
    this.fillableColumns = ['site_id', 'room', 'rack']; 
  }

  /**
   * ค้นหา Location จาก site_id, room และ rack ซึ่งเป็น unique key
   * @param {number} siteId - ID ของ Site
   * @param {string} room - ชื่อห้อง
   * @param {string} rack - ชื่อ Rack
   * @returns {Promise<object|null>} ข้อมูล Location หรือ null ถ้าไม่พบ
   */

  async findAll(options = {}) {
    const { 
      limit = null, 
      offset = 0, 
      orderBy = null, 
      orderDirection = 'ASC',
      where = null,
      includeSiteNames = false // เพิ่ม option ใหม่
    } = options;

    let sql;
    let params = [];

    if (includeSiteNames) {
      sql = `
        SELECT 
          l.id,
          l.site_id,
          s.name AS site_name,
          l.room,
          l.rack,
          l.created_at,
          l.updated_at
        FROM locations l
        JOIN sites s ON l.site_id = s.id
      `;
    } else {
      sql = `SELECT * FROM ${this.tableName}`;
    }

    // เพิ่ม WHERE clause
    if (where) {
      const whereConditions = [];
      Object.keys(where).forEach(key => {
        whereConditions.push(`l.${key} = ?`); // ใช้ l. สำหรับตาราง locations
        params.push(where[key]);
      });
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // เพิ่ม ORDER BY
    if (orderBy) {
      const direction = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) 
        ? orderDirection.toUpperCase() 
        : 'ASC';
      sql += ` ORDER BY l.${orderBy} ${direction}`;
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
  }

  async findByRoomAndRack(siteId, room, rack) {
    try {
      const [rows] = await this.pool.query(
        `SELECT * FROM ${this.tableName} 
         WHERE site_id = ? AND room = ? AND rack = ? 
         LIMIT 1`,
        [siteId, room, rack]
      );
      return rows[0] || null;
    } catch (err) {
      this.logger.error(`Error in ${this.tableName}.findByRoomAndRack:`, err);
      throw err;
    }
  }

  /**
   * ค้นหา Location ทั้งหมดที่อยู่ใน Site เดียวกัน
   * @param {number} siteId - ID ของ Site
   * @returns {Promise<Array<object>>} ข้อมูล Location ทั้งหมดของ Site นั้น
   */
  async findBySite(siteId) {
    return this.findAll({ where: { site_id: siteId } });
  }

  /**
   * ค้นหา Location โดยใช้คำค้นหาจากคอลัมน์ room หรือ rack
   * @param {string} term - คำที่ต้องการค้นหา
   * @param {object} options - ตัวเลือกการค้นหา (เช่น limit, offset)
   * @returns {Promise<Array<object>>} รายการ Location ที่ตรงกับคำค้นหา
   */
  async searchLocations(term, options = {}) {
    const columns = ['room', 'rack'];
    return this.search(term, columns, options);
  }
}

module.exports = LocationModel;