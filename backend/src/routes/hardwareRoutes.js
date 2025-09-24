// src/routes/hardwareRoutes.js
const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');
const authMiddleware = require('../middleware/authMiddleware');

// ====== CREATE ======
router.post('/', authMiddleware, hardwareController.create);

// ====== READ ALL / SEARCH ======
router.get('/', authMiddleware, hardwareController.findAll);

// ====== Export To Excel ======
router.get('/export', authMiddleware, hardwareController.exportToExcel);

// ====== READ BY SPECIFIC FIELDS ======
// ต้องอยู่ก่อน /:id เพื่อป้องกัน conflict
router.get('/hostname/:hostname', authMiddleware, hardwareController.findByHostname);
router.get('/cluster/:cluster_id', authMiddleware, hardwareController.findByCluster);
router.get('/location/:location_id', authMiddleware, hardwareController.findByLocation);
router.get('/rack/:rack_id', authMiddleware, hardwareController.findByRack);

// ====== READ WITH RELATIONS ======
router.get('/:id/relations', authMiddleware, hardwareController.findWithRelations);

// ====== READ / UPDATE / DELETE BY ID ======
router.get('/:id', authMiddleware, hardwareController.findById);
router.put('/:id', authMiddleware, hardwareController.update);
router.delete('/:id', authMiddleware, hardwareController.delete);

module.exports = router;
