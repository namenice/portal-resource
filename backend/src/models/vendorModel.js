// src/models/vendorModel.js
const BaseModel = require('./baseModel');

class VendorModel extends BaseModel {
  constructor() {
    super('vendors'); // table name: users, primary key: id
    this.fillableColumns = ['name']; // columns ที่อนุญาตให้ insert/update
  }
  
  // search users โดยใช้ username
  async searchName(term, options = {}) {
    const columns = ['id', 'name'];
    return this.search(term, columns, options);
  }
}

module.exports = VendorModel;