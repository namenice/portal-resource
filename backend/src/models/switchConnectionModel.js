// src/models/switchConnectionModel.js
const BaseModel = require('./baseModel');

class SwitchConnectionModel extends BaseModel {
  constructor() {
    super('switch_connections'); // table name: switch_connections, primary key: id
    this.fillableColumns = [
      'hardware_id',
      'switch_id',
      'port'
    ];
  }

  // หา connection แบบ unique (switch_id + port)
  async findBySwitchPort(switch_id, port) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.tableName} 
       WHERE switch_id = ? AND port = ? LIMIT 1`,
      [switch_id, port]
    );
    return rows[0] || null;
  }
  
}

module.exports = SwitchConnectionModel;
