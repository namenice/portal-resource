// src/models/vendorModel.js
const BaseModel = require('./baseModel');

class SiteModel extends BaseModel {
  constructor() {
    super('sites'); // table name: users, primary key: id
    this.fillableColumns = ['name']; // columns ที่อนุญาตให้ insert/update
  }
  
  // search users โดยใช้ username
  async searchName(term, options = {}) {
    const columns = ['id', 'name'];
    return this.search(term, columns, options);
  }
}

module.exports = SiteModel;