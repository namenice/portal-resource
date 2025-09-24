// src/routes/hardwareTypeRoutes.js
const express = require('express');
const router = express.Router();
const hardwareTypeController = require('../controllers/hardwareTypeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, hardwareTypeController.create)
router.get('/', authMiddleware, hardwareTypeController.findAll);
router.get('/:id', authMiddleware, hardwareTypeController.findById);
router.put('/:id', authMiddleware, hardwareTypeController.update);
router.delete('/:id', authMiddleware, hardwareTypeController.delete);

module.exports = router;
