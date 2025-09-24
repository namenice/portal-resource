// src/routes/index.js
const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const vendorRoutes = require('./vendorRoutes');
const hardwareTypeRoutes = require('./hardwareTypeRoutes');
const hardwareStatusRoutes = require('./hardwareStatusRoutes');
const siteRoutes = require('./siteRoutes');
const hardwareModelRoutes = require('./hardwareModelRoutes');
const projectRoutes = require('./projectRoutes');
const clusterRoutes = require('./clusterRoutes');
const locationRoutes = require('./locationRoutes');
const hardwareRoutes = require('./hardwareRoutes');
const switchRoutes = require('./switchRoutes');
const switchConnectionRoutes = require('./switchConnectionRoutes');
const networkInterfaceRoutes = require('./networkInterfaceRoutes');

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes)
router.use('/hardwaretypes', hardwareTypeRoutes);
router.use('/hardwarestatus', hardwareStatusRoutes);
router.use('/sites', siteRoutes);
router.use('/hardwaremodels', hardwareModelRoutes);
router.use('/projects', projectRoutes);
router.use('/clusters', clusterRoutes);
router.use('/locations', locationRoutes);
router.use('/hardwares', hardwareRoutes);
router.use('/switches', switchRoutes);
router.use('/switchconnections', switchConnectionRoutes);
router.use('/networkinterfaces', networkInterfaceRoutes);

module.exports = router;
