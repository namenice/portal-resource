// src/models/projectModel.js
const BaseModel = require('./baseModel');

class ProjectsModel extends BaseModel {
  constructor() {
    super('projects'); // table name: users, primary key: id
    this.fillableColumns = ['name','owner','description']; // columns ที่อนุญาตให้ insert/update
  }

  // search hardware models โดยใช้ brand หรือ model
  async searchPorject(term, options = {}) {
    const columns = ['id','name','owner','description'];
    return this.search(term, columns, options);
  }
}

module.exports = ProjectsModel;