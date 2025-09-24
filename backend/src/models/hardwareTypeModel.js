// src/models/hardwareTypeModel.js
const BaseModel = require('./baseModel');

class HardwareTypeModel extends BaseModel {
  constructor() {
    super('hardware_types'); // table name: users, primary key: id
    this.fillableColumns = ['name','description']; // columns ที่อนุญาตให้ insert/update
  }
  
  // search users โดยใช้ username
  async searchName(term, options = {}) {
    const columns = ['id', 'name', 'description'];
    return this.search(term, columns, options);
  }
}

module.exports = HardwareTypeModel;