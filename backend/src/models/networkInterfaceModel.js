// src/models/networkInterfaceModel.js
const BaseModel = require('./baseModel');

class NetworkInterfaceModel extends BaseModel {
  constructor() {
    super('network_interfaces'); // table name: network_interfaces, primary key: id
    this.fillableColumns = [
      'hardware_id',
      'interface_name',
      'ip_address',
      'netmask',
      'gateway',
      'mac_address',
      'vlan',
      'description',
      'is_primary'
    ];
  }

  // หา interfaces ทั้งหมดของ hardware
  async findByHardwareId(hardware_id) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE hardware_id = ?`,
      [hardware_id]
    );
    return rows;
  }

  // หา interface แบบ unique (hardware_id + interface_name)
  async findByHardwareAndName(hardware_id, interface_name) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.tableName} 
       WHERE hardware_id = ? AND interface_name = ? LIMIT 1`,
      [hardware_id, interface_name]
    );
    return rows[0] || null;
  }

  // หา interface จาก IP
  async findByIp(ip_address) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE ip_address = ? LIMIT 1`,
      [ip_address]
    );
    return rows[0] || null;
  }

  // หา interface จาก MAC
  async findByMac(mac_address) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE mac_address = ? LIMIT 1`,
      [mac_address]
    );
    return rows[0] || null;
  }
}

module.exports = NetworkInterfaceModel;
