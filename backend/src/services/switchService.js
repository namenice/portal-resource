// src/services/switchService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const SwitchModel = require('../models/switchModel');
const switchModel = new SwitchModel();

class SwitchService {
    async create(data) {
        const { name, model_id } = data;
        if (!name || !model_id) {
            throw new BadRequestError('name and model_id are required');
        }

        const existing = await switchModel.findByName(name);
        if (existing) {
            throw new BadRequestError(`Switch with name "${name}" already exists`);
        }

        return await switchModel.create(data);
    }

    async findAll(search) {
        // เรียกใช้เมธอด findAllWithDetails ที่แก้ไขใน Model
        const data = await switchModel.findAllWithDetails({ search });

        // จัดโครงสร้างข้อมูลใหม่ให้เป็นรูปแบบที่ต้องการ
        return data.map(sw => {
            return {
                id: sw.id,
                name: sw.name,
                model_id: {
                    id: sw.model_id,
                    model: sw.model,
                    brand: sw.brand,
                },
                vendor_id: {
                    id: sw.vendor_id,
                    name: sw.vendor_name,
                },
                location_id: {
                    id: sw.location_id,
                    room: sw.room,
                    rack: sw.rack,
                },
                ip_mgmt: sw.ip_mgmt,
                note: sw.note,
                specifications: sw.specifications,
                created_at: sw.created_at,
                updated_at: sw.updated_at,
            };
        });
    }

    /**
     * ดึงข้อมูล Switch ด้วย ID พร้อมรายละเอียดของ Model, Vendor, และ Location
     * @param {string} id - ID ของ Switch
     * @returns {Promise<Object>} ข้อมูล Switch พร้อมรายละเอียด
     */
    async findById(id) {
        // เปลี่ยนมาเรียกใช้ findByIdWithDetails แทน findById
        const data = await switchModel.findByIdWithDetails(id);
        if (!data) {
            throw new NotFoundError(`Not found id=${id}`);
        }

        // จัดโครงสร้างข้อมูลใหม่ให้เป็นรูปแบบที่ต้องการ
        return {
            id: data.id,
            name: data.name,
            model_id: {
                id: data.model_id,
                model: data.model,
                brand: data.brand,
            },
            vendor_id: {
                id: data.vendor_id,
                name: data.vendor_name,
            },
            location_id: {
                id: data.location_id,
                room: data.room,
                rack: data.rack,
            },
            ip_mgmt: data.ip_mgmt,
            note: data.note,
            specifications: data.specifications,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
    }

    /**
     * อัปเดตข้อมูล Switch
     * @param {string} id - ID ของ Switch ที่ต้องการอัปเดต
     * @param {object} fields - ข้อมูลที่ต้องการอัปเดต
     * @returns {Promise<Object>} ข้อมูล Switch ที่อัปเดตแล้ว
     */
    async update(id, fields) {
        if (fields.name) {
            const dup = await switchModel.findByName(fields.name);
            if (dup && dup.id !== parseInt(id, 10)) {
                throw new BadRequestError(`Switch with name "${fields.name}" already exists`);
            }
        }

        // แก้ไข: เปลี่ยนจาก isUpdated เป็น updatedData
        const updatedData = await switchModel.update(id, fields);
        if (!updatedData) {
            throw new NotFoundError(`Not found id=${id}`);
        }
        
        // คืนค่า updatedData โดยตรง ซึ่งเป็นข้อมูลที่ดึงมาจากฐานข้อมูลหลังจากอัปเดต
        return updatedData;
    }

    async delete(id) {
        const existing = await switchModel.findById(id);
        if (!existing) throw new NotFoundError(`Switch ID ${id} not found`);
        await switchModel.delete(id);
        return { message: `Deleted Switch ID ${id} Successfully` };
    }

    async findConnectedHardware(switch_id) {
        const switchData = await switchModel.findById(switch_id);
        if (!switchData) throw new NotFoundError(`Switch ID ${switch_id} not found`);
        return await switchModel.findConnectedHardware(switch_id);
    }
}

module.exports = new SwitchService();