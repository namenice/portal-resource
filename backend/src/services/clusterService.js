// src/services/clusterService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const ClusterModel = require('../models/clusterModel');
const clusterModel = new ClusterModel();

class clusterService {
    async create(data) {
        const { name, project_id, description } = data;
        if (!name || !project_id) {
            throw new Error('Name and Project id are required');
        }
        const existing = await clusterModel.findByColumn(name);
        if (existing) {
            throw new Error(`Cluster Name ${name} already exists`);
        }
        return await clusterModel.create({ name, project_id, description });
    }

    async findAll(search) {
        const data = await clusterModel.findAllWithProjectDetails(search);
        // ปรับเปลี่ยนโครงสร้างข้อมูลที่นี่
        return data.map(item => ({
            id: item.id,
            name: item.name,
            project: {
                id: item.project_id,
                project_name: item.project_name
            },
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at
        }));
    }

    async findById(id) {
        const item = await clusterModel.findByIdWithProjectDetails(id);
        if (!item) throw new NotFoundError(`Not found id=${id}`);
        
        // ปรับเปลี่ยนโครงสร้างข้อมูลสำหรับรายการเดียว
        return {
            id: item.id,
            name: item.name,
            project: {
                id: item.project_id,
                project_name: item.project_name
            },
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at
        };
    }

    async update(id, fields) {
        const dataUpdate = await clusterModel.update(id, fields);
        if (!dataUpdate) throw new NotFoundError(`Cluster not found`);
        return dataUpdate;
    }

    async delete(id) {
        const dataDelete = await clusterModel.findById(id);
        if (!dataDelete) throw new NotFoundError(`Cluster ID ${id} not found`);
        await clusterModel.delete(id);
        return { message: `Deleted Cluster ID ${id} Successfully` };
    }
}

module.exports = new clusterService();