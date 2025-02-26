const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbManager = require('../../sequelize/mapper/databaseManager');
// const { operator } = dbManager.getClientsDB();
const { operator } = dbManager.getDbLoaderDB();


/**
 * Registers a new user with hashed password.
 *
 * @param {string} email - User's email address.
 * @param {string} password - User's plain-text password.
 * @param {string} firstName - User's first name.
 * @param {string} lastName - User's last name.
 * @returns {Promise<Object>} - Newly created user data (without password).
 * @throws {Error} If registration fails or user already exists.
 */
async function registerUser(email, password, firstName, lastName) {
    try {
      
        const existingUser = await operator.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email already registered.');
        }

       
        const hashedPassword = await bcrypt.hash(password, 12);

       
        const newUser = await operator.create({
            email,
            password: hashedPassword,
            first_name: firstName, 
            last_name: lastName,
        });

        
        const { password: _, ...userData } = newUser.dataValues;
        return userData;
    } catch (error) {
        console.error('Error registering user:', error.message);
        throw new Error('User registration failed.');
    }
}

/**
 * Authenticates a user and generates a JWT token.
 *
 * @param {string} email - User's email address.
 * @param {string} password - User's plain-text password.
 * @returns {Promise<string>} - JWT token.
 * @throws {Error} If authentication fails.
 */
async function authenticateUser(email, password) {
    try {
        
        const user = await operator.findOne({ where: { email } });
        if (!user) {
            throw new Error('Invalid email or password.');
        }

       
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password.');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return token;
    } catch (error) {
        console.error('Error authenticating user:', error.message);
        throw new Error('User authentication failed.');
    }
}

module.exports = {
    registerUser,
    authenticateUser,
};
