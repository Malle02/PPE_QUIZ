const express = require('express');
const router = express.Router();
const recordersController = require('../controllers/recordersController');

// Define routes for camera operations

// GET: Fetch all recorder
router.get('/', recordersController.getAllRecorders);

// GET: Fetch a specific recorder by ID
router.get('/:id', recordersController.getRecorderById);


module.exports = router;