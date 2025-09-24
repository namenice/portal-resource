// src/routes/switchRoutes.js
const express = require('express');
const router = express.Router();
const switchController = require('../controllers/switchController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',authMiddleware,switchController.create);
router.get('/', authMiddleware, switchController.findAll);
router.get('/:id', authMiddleware, switchController.findById);
router.put('/:id', authMiddleware, switchController.update);
router.delete('/:id', authMiddleware, switchController.delete);
router.get('/:id/hardware', authMiddleware, switchController.findConnectedHardware);

module.exports = router;
