// src/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, locationController.create);
router.get('/', authMiddleware, locationController.findAll);
router.get('/find', authMiddleware, locationController.findByRoomAndRack);
router.get('/:id', authMiddleware, locationController.findById);
router.put('/:id', authMiddleware, locationController.update);
router.delete('/:id', authMiddleware, locationController.delete);

module.exports = router;