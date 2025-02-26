const authService = require('../services/auth/authService');
const jwt = require('jsonwebtoken');

// Operator Registration
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        
        const user = await authService.registerUser(email, password, firstName, lastName);
        
        res.status(201).json({
            message: "User successfully registered.",
            userId: user.guid
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(400).json({ error: error.message });
    }
};

// Operator Login (with session management)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const token = await authService.authenticateUser(email, password);
        
        // Decode token to get user ID for session
        const decoded = jwt.decode(token);

        // Server-side session
        req.session.userId = decoded.userId;
        req.session.email = email;

        res.status(200).json({ 
            token,
            message: "Connection successful, session created." 
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(401).json({ error: error.message });
    }
};


const checkSession = (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ 
            connected: true,
            userId: req.session.userId,
            email: req.session.email
        });
    } else {
        res.status(401).json({ 
            connected: false, 
            message: "No session or session expired." 
        });
    }
};


const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err.message);
            return res.status(500).json({ message: "Error during disconnection." });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Successful disconnection." });
    });
};

module.exports = {
    register,
    login,
    checkSession,
    logout
};
