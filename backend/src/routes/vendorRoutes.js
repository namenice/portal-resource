// src/routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',authMiddleware,vendorController.create);
router.get('/', authMiddleware, vendorController.findAll);
router.get('/:id', authMiddleware, vendorController.findById);
router.put('/:id', authMiddleware, vendorController.update);
router.delete('/:id', authMiddleware, vendorController.delete);

module.exports = router;
