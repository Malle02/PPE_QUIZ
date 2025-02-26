const express = require('express');
const router = express.Router();
const camerasController = require('../controllers/camerasController'); // Import your controllers

// Define routes for camera operations

// GET: Fetch all cameras
router.get('/', camerasController.getAllCameras);

// GET: Fetch a specific camera by ID
router.get('/:id', camerasController.getCameraById);

// GET: Fetch a specific camera's ptz settings'
router.get('/:id/ptzSettings', camerasController.getPTZSettings);


module.exports = router;
