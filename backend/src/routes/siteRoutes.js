// src/routes/hardwareStatusRoutes.js
const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, siteController.create)
router.get('/', authMiddleware, siteController.findAll);
router.get('/:id', authMiddleware, siteController.findById);
router.put('/:id', authMiddleware, siteController.update);
router.delete('/:id', authMiddleware, siteController.delete);

module.exports = router;
