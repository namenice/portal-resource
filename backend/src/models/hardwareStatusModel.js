// src/models/hardwareStatusModel.js
const BaseModel = require('./baseModel');

class HardwareStatusModel extends BaseModel {
  constructor() {
    super('hardware_statuses'); // table name: users, primary key: id
    this.fillableColumns = ['name','description']; // columns ที่อนุญาตให้ insert/update
  }
  
  // search users โดยใช้ username
  async searchName(term, options = {}) {
    const columns = ['id', 'name', 'description'];
    return this.search(term, columns, options);
  }
}

module.exports = HardwareStatusModel;