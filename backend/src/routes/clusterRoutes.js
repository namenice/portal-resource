// src/routes/clusterRoutes.js
const express = require('express');
const router = express.Router();
const clusterController = require('../controllers/clusterController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',authMiddleware,clusterController.create);
router.get('/', authMiddleware, clusterController.findAll);
router.get('/:id', authMiddleware, clusterController.findById);
router.put('/:id', authMiddleware, clusterController.update);
router.delete('/:id', authMiddleware, clusterController.delete);

module.exports = router;
