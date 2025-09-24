// src/models/switchModel.js
const BaseModel = require('./baseModel');
const logger = require('../utils/logger');

class SwitchModel extends BaseModel {
    constructor() {
        super('switches');
        this.fillableColumns = [
            'name',
            'model_id',
            'vendor_id',
            'location_id',
            'ip_mgmt',
            'note',
            'specifications'
        ];
    }

    /**
     * ดึงข้อมูล Switch ทั้งหมดพร้อมรายละเอียดของ Model, Vendor, และ Location
     * @param {object} options - ตัวเลือกการค้นหา
     * @param {string} options.search - ข้อความสำหรับค้นหา
     * @param {number} options.limit - จำนวนรายการที่ต้องการ
     * @param {number} options.offset - ตำแหน่งเริ่มต้น
     * @param {string} options.orderBy - คอลัมน์ที่ใช้เรียงลำดับ
     * @param {string} options.orderDirection - ทิศทางการเรียงลำดับ (ASC/DESC)
     * @returns {Promise<Array<Object>>}
     */
    async findAllWithDetails(options = {}) {
        try {
            const { 
                search = null, 
                limit = null, 
                offset = 0, 
                orderBy = 'switches.id', 
                orderDirection = 'ASC' 
            } = options;

            // Use LEFT JOIN to join switches with hardware_models, vendors and locations
            let sql = `
                SELECT 
                    switches.*,
                    hardware_models.brand,
                    hardware_models.model,
                    vendors.name AS vendor_name,
                    locations.room,
                    locations.rack
                FROM ${this.tableName} switches
                LEFT JOIN hardware_models ON switches.model_id = hardware_models.id
                LEFT JOIN vendors ON switches.vendor_id = vendors.id
                LEFT JOIN locations ON switches.location_id = locations.id
            `;
            const params = [];

            // Add WHERE clause for search
            if (search) {
                const searchColumns = ['switches.name', 'switches.ip_mgmt', 'switches.note', 'switches.specifications'];
                const searchTerm = `%${search}%`;
                const searchClause = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
                sql += ` WHERE ${searchClause}`;
                searchColumns.forEach(() => params.push(searchTerm));
            }
            
            // Add ORDER BY
            const direction = ['ASC', 'DESC'].includes(orderDirection.toUpperCase()) 
                ? orderDirection.toUpperCase() 
                : 'ASC';
            sql += ` ORDER BY ${orderBy} ${direction}`;

            // Add LIMIT and OFFSET
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
            logger.error(`Error in ${this.tableName}.findAllWithDetails:`, err);
            throw err;
        }
    }

    /**
     * ดึงข้อมูล Switch ด้วย ID พร้อมรายละเอียดของ Model, Vendor, และ Location
     * @param {number} id - ID ของ Switch ที่ต้องการ
     * @returns {Promise<Object|null>}
     */
    async findByIdWithDetails(id) {
        try {
            const sql = `
                SELECT 
                    switches.*,
                    hardware_models.brand,
                    hardware_models.model,
                    vendors.name AS vendor_name,
                    locations.room,
                    locations.rack
                FROM ${this.tableName} switches
                LEFT JOIN hardware_models ON switches.model_id = hardware_models.id
                LEFT JOIN vendors ON switches.vendor_id = vendors.id
                LEFT JOIN locations ON switches.location_id = locations.id
                WHERE switches.id = ?
                LIMIT 1
            `;
            const [rows] = await this.pool.query(sql, [id]);
            return rows[0] || null;
        } catch (err) {
            logger.error(`Error in ${this.tableName}.findByIdWithDetails:`, err);
            throw err;
        }
    }

    /**
     * อัปเดตข้อมูล Switch
     * @param {number} id - ID ของ Switch ที่ต้องการอัปเดต
     * @param {object} data - ข้อมูลที่ต้องการอัปเดต
     * @returns {Promise<Object|null>} ข้อมูล Switch ที่อัปเดตแล้ว หรือ null หากไม่พบ
     */
    async update(id, data) {
        try {
            // เรียกใช้เมธอด update จาก BaseModel โดยตรง
            const result = await super.update(id, data);
            return result;
        } catch (err) {
            logger.error(`Error in ${this.tableName}.update:`, err);
            throw err;
        }
    }

    // Find a switch by name (unique)
    async findByName(name) {
        const [rows] = await this.pool.query(
            `SELECT * FROM ${this.tableName} WHERE name = ? LIMIT 1`,
            [name]
        );
        return rows[0] || null;
    }

    // Find all switches in a location
    async findByLocation(location_id) {
        const [rows] = await this.pool.query(
            `SELECT * FROM ${this.tableName} WHERE location_id = ?`,
            [location_id]
        );
        return rows;
    }

    // search switches using name, ip_mgmt, note, specifications
    async searchSwitches(term, options = {}) {
        const columns = ['name', 'ip_mgmt', 'note', 'specifications'];
        return this.search(term, columns, options);
    }

    // Find connected hardware for a switch
    async findConnectedHardware(switch_id) {
        const [rows] = await this.pool.query(
            `SELECT h.*, sc.port
            FROM hardware h
            JOIN switch_connections sc ON h.id = sc.hardware_id
            WHERE sc.switch_id = ?`,
            [switch_id]
        );
        return rows;
    }
}

module.exports = SwitchModel;