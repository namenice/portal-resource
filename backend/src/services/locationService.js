// src/services/locationService.js
const { NotFoundError, BadRequestError } = require('../errors/customError');
const LocationModel = require('../models/locationModel');

class LocationService {
  constructor() {
    this.locationModel = new LocationModel();
  }

  async create(data) {
    const { site_id, room, rack } = data;
    if (!site_id || !room || !rack) {
      throw new BadRequestError('site_id, room, and rack are required');
    }

    // Use the model's method to check for duplicates
    const existing = await this.locationModel.findByRoomAndRack(site_id, room, rack);
    if (existing) {
      throw new BadRequestError(
        `Location already exists (site_id=${site_id}, room=${room}, rack=${rack})`
      );
    }

    return await this.locationModel.create({ site_id, room, rack });
  }

  async findAll(options = {}) {
    try {
        // ส่ง options ทั้งหมดไปยัง model
        return await this.locationModel.findAll(options);
    } catch (err) {
        throw new Error(`Failed to fetch locations: ${err.message}`);
    }
  }

  async findById(id) {
    const data = await this.locationModel.findById(id);
    if (!data) throw new NotFoundError(`Not found id=${id}`);
    return data;
  }

  async update(id, fields) {
    // Validate existence of the record to be updated first
    const existingLocation = await this.locationModel.findById(id);
    if (!existingLocation) {
        throw new NotFoundError(`Location not found with id=${id}`);
    }

    // If any part of the unique key is being updated, check for conflicts
    const updatedSiteId = fields.site_id ?? existingLocation.site_id;
    const updatedRoom = fields.room ?? existingLocation.room;
    const updatedRack = fields.rack ?? existingLocation.rack;

    // Check for unique key conflict using the model's method
    const conflict = await this.locationModel.findByRoomAndRack(updatedSiteId, updatedRoom, updatedRack);
    if (conflict && conflict.id !== parseInt(id, 10)) {
        throw new BadRequestError(
            `Location already exists (site_id=${updatedSiteId}, room=${updatedRoom}, rack=${updatedRack})`
        );
    }

    const updated = await this.locationModel.update(id, fields);
    return updated; // Model's update method handles the not found case and returns null.
  }

  async delete(id) {
    const isDeleted = await this.locationModel.delete(id);
    if (!isDeleted) throw new NotFoundError(`Location ID ${id} not found`);
    return { message: `Deleted Location ID ${id} Successfully` };
  }
}

module.exports = new LocationService();