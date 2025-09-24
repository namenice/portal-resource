// src/routes/hardwareStatusRoutes.js
const express = require('express');
const router = express.Router();
const hardwareStatusController = require('../controllers/hardwareStatusController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, hardwareStatusController.create)
router.get('/', authMiddleware, hardwareStatusController.findAll);
router.get('/:id', authMiddleware, hardwareStatusController.findById);
router.put('/:id', authMiddleware, hardwareStatusController.update);
router.delete('/:id', authMiddleware, hardwareStatusController.delete);

module.exports = router;
