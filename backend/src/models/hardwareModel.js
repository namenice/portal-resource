// src/models/hardwareModel.js
const BaseModel = require('./baseModel');
const ExcelJS = require('exceljs');
const moment = require('moment');



class HardwareModel extends BaseModel {
    constructor() {
        super('hardware'); // table name: hardware, primary key: id
        this.fillableColumns = [
            'hostname',
            'status_id',
            'ipmi',
            'serial',
            'type_id',
            'model_id',
            'vendor_id',
            'owner',
            'specifications',
            'note',
            'location_id',
            'unit_range',
            'cluster_id'
        ];
    }

    // ====== BASE SELECT WITH JOIN ARRAYS ======
    _baseSelectWithArrays() {
        return `
            SELECT 
                h.id,
                h.hostname,
                h.ipmi,
                h.serial,
                h.owner,
                h.specifications,
                h.note,
                h.unit_range,
                h.created_at,
                h.updated_at,
                
                hs.id AS status_id,
                hs.name AS status_name,

                ht.id AS type_id,
                ht.name AS type_name,

                hm.id AS model_id,
                hm.brand AS model_brand,
                hm.model AS model_name,

                v.id AS vendor_id,
                v.name AS vendor_name,

                l.id AS location_id,
                s.name AS site_name,
                l.room AS room,
                l.rack AS rack,

                c.id AS cluster_id,
                c.name AS cluster_name,
                p.id AS project_id,
                p.name AS project_name,

                -- switches connected
                IFNULL((
                    SELECT JSON_ARRAYAGG(JSON_OBJECT(
                        'id', sc.switch_id,
                        'name', sw.name,
                        'ip_mgmt', sw.ip_mgmt,
                        'port', sc.port
                    ))
                    FROM switch_connections sc
                    JOIN switches sw ON sc.switch_id = sw.id
                    WHERE sc.hardware_id = h.id
                ), JSON_ARRAY()) AS switches,

                -- network interfaces
                IFNULL((
                    SELECT JSON_ARRAYAGG(JSON_OBJECT(
                        'id', ni.id,
                        'interface_name', ni.interface_name,
                        'ip_address', ni.ip_address,
                        'netmask', ni.netmask,
                        'gateway', ni.gateway,
                        'mac_address', ni.mac_address,
                        'vlan', ni.vlan,
                        'description', ni.description,
                        'is_primary', ni.is_primary
                    ))
                    FROM network_interfaces ni
                    WHERE ni.hardware_id = h.id
                ), JSON_ARRAY()) AS network_interfaces

            FROM hardware h
            LEFT JOIN hardware_statuses hs ON h.status_id = hs.id
            LEFT JOIN hardware_types ht ON h.type_id = ht.id
            LEFT JOIN hardware_models hm ON h.model_id = hm.id
            LEFT JOIN vendors v ON h.vendor_id = v.id
            LEFT JOIN locations l ON h.location_id = l.id
            LEFT JOIN sites s ON l.site_id = s.id
            LEFT JOIN clusters c ON h.cluster_id = c.id
            LEFT JOIN projects p ON c.project_id = p.id
        `;
    }

    // ====== UTILITIES ======
    _mapRowToJson(row) {
        return {
            id: row.id,
            hostname: row.hostname,
            ipmi: row.ipmi,
            serial: row.serial,
            owner: row.owner,
            specifications: row.specifications,
            note: row.note,
            unit_range: row.unit_range,
            created_at: row.created_at,
            updated_at: row.updated_at,
            status: {
                id: row.status_id,
                name: row.status_name
            },
            type: {
                id: row.type_id,
                name: row.type_name
            },
            model: {
                id: row.model_id,
                brand: row.model_brand,
                model: row.model_name
            },
            vendor: {
                id: row.vendor_id,
                name: row.vendor_name
            },
            location: {
                id: row.location_id,
                site_name: row.site_name,
                room: row.room,
                rack: row.rack
            },
            cluster: {
                id: row.cluster_id,
                name: row.cluster_name,
                project: {
                    id: row.project_id,
                    name: row.project_name
                }
            },
            switches: JSON.parse(row.switches || '[]'),
            network_interfaces: JSON.parse(row.network_interfaces || '[]')
        };
    }

    // ====== CRUD WITH RELATIONS ======
    async createWithRelations(fields) {
        const record = await super.create(fields);
        return this.findByIdWithRelations(record.id);
    }

    async findByIdWithRelations(id) {
        const sql = this._baseSelectWithArrays() + ` WHERE h.id = ? GROUP BY h.id LIMIT 1`;
        const [rows] = await this.pool.query(sql, [id]);
        if (!rows[0]) return null;
        return this._mapRowToJson(rows[0]);
    }

    async findAllWithRelations(options = {}) {
        let sql = this._baseSelectWithArrays();
        const params = [];

        if (options.where) {
            const conditions = Object.keys(options.where).map(key => {
                params.push(options.where[key]);
                return `h.${key} = ?`;
            });
            if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' GROUP BY h.id';

        if (options.orderBy) {
            const direction = ['ASC', 'DESC'].includes(options.orderDirection?.toUpperCase())
                ? options.orderDirection.toUpperCase()
                : 'ASC';
            sql += ` ORDER BY h.${options.orderBy} ${direction}`;
        }

        if (options.limit) {
            sql += ` LIMIT ?`;
            params.push(options.limit);
            if (options.offset) {
                sql += ` OFFSET ?`;
                params.push(options.offset);
            }
        }

        const [rows] = await this.pool.query(sql, params);
        return rows.map(this._mapRowToJson);
    }
    
    async createWithRelations(fields) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Create the main hardware record
            const hardwareFields = this.fillableColumns.reduce((acc, col) => {
                if (fields[col] !== undefined) {
                    acc[col] = fields[col];
                }
                return acc;
            }, {});
            const [result] = await connection.query('INSERT INTO hardware SET ?', hardwareFields);
            const newHardwareId = result.insertId;

            // 2. Insert Network Interfaces
            if (Array.isArray(fields.network_interfaces) && fields.network_interfaces.length > 0) {
                const networkValues = fields.network_interfaces.map(intf => [
                    newHardwareId,
                    intf.interface_name || null,
                    intf.ip_address || null,
                    intf.netmask || null,
                    intf.gateway || null,
                    intf.mac_address || null,
                    intf.vlan || null,
                    intf.description || null,
                    intf.is_primary ? 1 : 0
                ]);
                await connection.query(
                    'INSERT INTO network_interfaces (hardware_id, interface_name, ip_address, netmask, gateway, mac_address, vlan, description, is_primary) VALUES ?',
                    [networkValues]
                );
            }

            // 3. Insert Switches
            if (Array.isArray(fields.switches) && fields.switches.length > 0) {
                const switchValues = fields.switches.map(sw => [
                    newHardwareId,
                    sw.id || null, // Assuming sw.id from frontend is the switch_id
                    sw.port || null
                ]);
                await connection.query(
                    'INSERT INTO switch_connections (hardware_id, switch_id, port) VALUES ?',
                    [switchValues]
                );
            }

            await connection.commit();
            return this.findByIdWithRelations(newHardwareId); // Return the complete record
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }    

    async updateWithRelations(id, fields) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. อัปเดตข้อมูลหลักของ Hardware
            const hardwareFields = this.fillableColumns.reduce((acc, col) => {
                if (fields[col] !== undefined) {
                    acc[col] = fields[col];
                }
                return acc;
            }, {});
            await connection.query('UPDATE hardware SET ? WHERE id = ?', [hardwareFields, id]);

            // 2. จัดการการอัปเดต Network Interfaces
            if (Array.isArray(fields.network_interfaces)) {
                await connection.query('DELETE FROM network_interfaces WHERE hardware_id = ?', [id]);
                if (fields.network_interfaces.length > 0) {
                    const values = fields.network_interfaces.map(intf => [
                        id,
                        intf.interface_name || null,
                        intf.ip_address || null,
                        intf.netmask || null,
                        intf.gateway || null,
                        intf.mac_address || null,
                        intf.vlan || null,
                        intf.description || null,
                        intf.is_primary ? 1 : 0
                    ]);
                    await connection.query(
                        'INSERT INTO network_interfaces (hardware_id, interface_name, ip_address, netmask, gateway, mac_address, vlan, description, is_primary) VALUES ?',
                        [values]
                    );
                }
            }

            // 3. จัดการการอัปเดต Switches
            if (Array.isArray(fields.switches)) {
                await connection.query('DELETE FROM switch_connections WHERE hardware_id = ?', [id]);
                if (fields.switches.length > 0) {
                    const values = fields.switches.map(sw => [
                        id,
                        sw.id || null, // sw.id ในที่นี้คือ switch_id
                        sw.port || null
                    ]);
                    await connection.query(
                        'INSERT INTO switch_connections (hardware_id, switch_id, port) VALUES ?',
                        [values]
                    );
                }
            }
            
            await connection.commit();
            return this.findByIdWithRelations(id); // ส่งคืนข้อมูลที่อัปเดตแล้วทั้งหมด
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteWithRelations(id) {
        const record = await this.findByIdWithRelations(id);
        if (!record) return null;
        await super.delete(id);
        return record;
    }

    // ====== EXTRA QUERIES ======
    async findByHostname(hostname) {
        const sql = this._baseSelectWithArrays() + ` WHERE h.hostname = ? GROUP BY h.id LIMIT 1`;
        const [rows] = await this.pool.query(sql, [hostname]);
        if (!rows[0]) return null;
        return this._mapRowToJson(rows[0]);
    }

    async searchHardware(term, options = {}) {
        if (!term) throw new Error('Search term is required');

        const columns = [
            'h.hostname', 'h.serial', 'h.ipmi', 'h.owner',
            'hm.model', 'v.name', 'l.room', 'l.rack', 'c.name', 'p.name'
        ];

        const operator = options.exact ? '=' : 'LIKE';
        const searchTerm = options.exact ? term : `%${term}%`;

        // Correctly build the WHERE clause and params array
        const whereClause = columns.map(col => `${col} ${operator} ?`).join(' OR ');
        const params = columns.map(() => searchTerm);

        let sql = this._baseSelectWithArrays() + ` WHERE ${whereClause} GROUP BY h.id`;

        if (options.orderBy) {
            const direction = ['ASC', 'DESC'].includes(options.orderDirection?.toUpperCase())
                ? options.orderDirection.toUpperCase()
                : 'ASC';
            sql += ` ORDER BY h.${options.orderBy} ${direction}`;
        }

        if (options.limit) {
            sql += ` LIMIT ?`;
            params.push(options.limit);
            if (options.offset) {
                sql += ` OFFSET ?`;
                params.push(options.offset);
            }
        }

        const [rows] = await this.pool.query(sql, params);
        return rows.map(this._mapRowToJson);
    }

    // ====== Export To Excel ======
    async exportToExcel(options = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Hardware Report");

    const allHardware = await this.findAllWithRelations(options);

    worksheet.columns = [
        { header: "ID", key: "id", width: 8 },
        { header: "Hostname", key: "hostname", width: 25 },
        { header: "IPMI", key: "ipmi", width: 20 },
        { header: "Serial", key: "serial", width: 20 },
        { header: "Owner", key: "owner", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Type", key: "type", width: 20 },
        { header: "Brand", key: "brand", width: 20 },
        { header: "Model", key: "model", width: 25 },
        { header: "Vendor", key: "vendor", width: 20 },
        { header: "Site", key: "site", width: 15 },
        { header: "Room", key: "room", width: 20 },
        { header: "Rack", key: "rack", width: 15 },
        { header: "Cluster", key: "cluster", width: 25 },
        { header: "Project", key: "project", width: 25 },
        { header: "Unit Range", key: "unit_range", width: 15 },
        { 
            header: "Switches", 
            key: "switches", 
            width: 40,
            style: { alignment: { wrapText: true } }   // ✅ เปิดให้ตัดบรรทัด
        },
        { 
            header: "Network Interfaces", 
            key: "network_interfaces", 
            width: 50,
            style: { alignment: { wrapText: true } }   // ✅ เปิดให้ตัดบรรทัด
        },
        { header: "Created At", key: "created_at", width: 20 },
        { header: "Updated At", key: "updated_at", width: 20 },
    ];

    allHardware.forEach((h) => {
        worksheet.addRow({
            id: h.id,
            hostname: h.hostname,
            ipmi: h.ipmi,
            serial: h.serial,
            owner: h.owner,
            status: h.status?.name || "",
            type: h.type?.name || "",
            brand: h.model?.brand || "",
            model: h.model?.model || "",
            vendor: h.vendor?.name || "",
            site: h.location?.site_name || "",
            room: h.location?.room || "",
            rack: h.location?.rack || "",
            cluster: h.cluster?.name || "",
            project: h.cluster?.project?.name || "",
            unit_range: h.unit_range,
            switches: (h.switches || [])
                .map((s) => `${s.name} - ${s.port || ""}`)
                .join(",\n"),   
            network_interfaces: (h.network_interfaces || [])
                .map((n) => `${n.interface_name} [${n.ip_address || ""} | ${n.mac_address || ""}]`)
                .join(",\n"),   
            created_at: h.created_at,
            updated_at: h.updated_at,
        });
    });

    return await workbook.xlsx.writeBuffer();
    }
}


module.exports = HardwareModel;