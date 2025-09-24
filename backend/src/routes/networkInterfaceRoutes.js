
// src/routes/switchConnectionRoutes.js
const express = require('express');
const router = express.Router();
const networkInterfaceRoutes = require('../controllers/networkInterfaceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',authMiddleware,networkInterfaceRoutes.create);
router.get('/',authMiddleware, networkInterfaceRoutes.findAll);
router.get('/:id',authMiddleware, networkInterfaceRoutes.findById);
router.put('/:id',authMiddleware, networkInterfaceRoutes.update);
router.delete('/:id',authMiddleware, networkInterfaceRoutes.delete);

module.exports = router;
