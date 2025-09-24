// src/routes/hardwareModelRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',authMiddleware,projectController.create);
router.get('/', authMiddleware, projectController.findAll);
router.get('/:id', authMiddleware, projectController.findById);
router.put('/:id', authMiddleware, projectController.update);
router.delete('/:id', authMiddleware, projectController.delete);

module.exports = router;
