// src/models/hardwareModelModel.js
const BaseModel = require('./baseModel');

class HardwareModelModel extends BaseModel {
  constructor() {
    super('hardware_models'); // table name: users, primary key: id
    this.fillableColumns = ['brand','model','description']; // columns ที่อนุญาตให้ insert/update
  }

  // search hardware models โดยใช้ brand หรือ model
  async searchModels(term, options = {}) {
    const columns = ['id', 'brand', 'model', 'description'];
    return this.search(term, columns, options);
  }

  // หา hardware model แบบ unique (brand + model)
  async findByBrandAndModel(brand, model) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE brand = ? AND model = ? LIMIT 1`,
      [brand, model]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = HardwareModelModel;


