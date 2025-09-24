// src/models/userModel.js
const BaseModel = require('./baseModel');

class UserModel extends BaseModel {
  constructor() {
    super('users'); // table name: users, primary key: id
    this.fillableColumns = ['username', 'password_hash']; // columns ที่อนุญาตให้ insert/update
  }

  // หา user by username
  async findByUsername(username) {
    return this.findByColumn(username, 'username');
  }

  // search users โดยใช้ username
  async searchUsers(term, options = {}) {
    const columns = ['id', 'username'];
    return this.search(term, columns, options);
  }
}

module.exports = UserModel;

