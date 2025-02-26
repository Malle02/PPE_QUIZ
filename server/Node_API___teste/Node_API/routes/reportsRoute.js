const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController'); // Import your controllers

// Define routes for alarm operations

// GET: Fetch alarm classifications
router.get('/', reportsController.getPaginatedReports);
router.post('/', reportsController.createReport);



module.exports = router;