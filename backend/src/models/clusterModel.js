// src/models/clusterModel.js
const BaseModel = require('./baseModel');

class ClusterModel extends BaseModel {
    constructor() {
        super('clusters');
        this.fillableColumns = ['name', 'project_id', 'description'];
    }

    async findAllWithProjectDetails(search = null) {
        try {
            let sql = `
                SELECT 
                    c.id, 
                    c.name, 
                    c.description, 
                    c.created_at,
                    c.updated_at,
                    c.project_id,
                    p.name as project_name
                FROM ${this.tableName} c
                LEFT JOIN projects p ON c.project_id = p.id
            `;
            const params = [];
            
            if (search) {
                sql += ` WHERE c.name LIKE ? OR c.description LIKE ?`;
                params.push(`%${search}%`, `%${search}%`);
            }
            
            sql += ` ORDER BY c.name ASC`;
            
            const [rows] = await this.pool.query(sql, params);
            return rows;
        } catch (err) {
            logger.error(`Error in ${this.tableName}.findAllWithProjectDetails:`, err);
            throw err;
        }
    }
    
    async findByIdWithProjectDetails(id) {
        try {
            if (!id) throw new Error('ID is required');
            
            const sql = `
                SELECT 
                    c.id, 
                    c.name, 
                    c.description, 
                    c.created_at,
                    c.updated_at,
                    c.project_id,
                    p.name as project_name
                FROM ${this.tableName} c
                LEFT JOIN projects p ON c.project_id = p.id
                WHERE c.id = ?
            `;
            const [rows] = await this.pool.query(sql, [id]);
            
            return rows[0] || null;
        } catch (err) {
            logger.error(`Error in ${this.tableName}.findByIdWithProjectDetails:`, err);
            throw err;
        }
    }

    async searchCluster(term, options = {}) {
        return this.findAllWithProjectDetails(term);
    }
}

module.exports = ClusterModel;
