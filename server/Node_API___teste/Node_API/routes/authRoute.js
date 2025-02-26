const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define routes for operators Authentification


// POST: register with personal information
router.post('/login', authController.login);

// POST: Login with email and password
router.post('/register', authController.register);

// GET: user session status
router.get('/check-session', authController.checkSession);


router.get('/logout', authController.logout);

module.exports = router;
