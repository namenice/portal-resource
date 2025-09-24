// src/routes/hardwareModelRoutes.js
const express = require('express');
const router = express.Router();
const hardwareModelController = require('../controllers/hardwareModelController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',authMiddleware,hardwareModelController.create);
router.get('/', authMiddleware, hardwareModelController.findAll);
router.get('/:id', authMiddleware, hardwareModelController.findById);
router.put('/:id', authMiddleware, hardwareModelController.update);
router.delete('/:id', authMiddleware, hardwareModelController.delete);

module.exports = router;
