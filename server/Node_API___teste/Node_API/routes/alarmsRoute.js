const express = require('express');
const router = express.Router();
const alarmsController = require('../controllers/alarmsController'); // Import your controllers

// Define routes for alarm operations

// GET: Fetch alarm classifications
router.get('/classifications', alarmsController.getAlarmClassifications);
router.get('/', alarmsController.getPaginatedAlarms);
router.patch('/:id', alarmsController.updateAlarm);


module.exports = router;