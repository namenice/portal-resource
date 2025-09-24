
// src/routes/switchConnectionRoutes.js
const express = require('express');
const router = express.Router();
const switchConnectionController = require('../controllers/switchConnectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',authMiddleware,switchConnectionController.create);
router.get('/',authMiddleware, switchConnectionController.findAll);
router.get('/:id',authMiddleware, switchConnectionController.findById);
router.put('/:id',authMiddleware, switchConnectionController.update);
router.delete('/:id',authMiddleware, switchConnectionController.delete);



module.exports = router;
