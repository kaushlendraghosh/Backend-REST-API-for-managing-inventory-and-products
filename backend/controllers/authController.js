const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateUsername, validatePassword, sanitizeInput } = require('../utils/validation');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
};

// Register new user
const registerUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Input validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const cleanUsername = sanitizeInput(username);

        if (!validateUsername(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username: cleanUsername });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Create new user
        const userData = {
            username: cleanUsername,
            password
        };

        // Only allow role setting in development or for first admin
        if (role && (process.env.NODE_ENV === 'development' || role === 'admin')) {
            const adminExists = await User.findOne({ role: 'admin' });
            if (!adminExists || process.env.NODE_ENV === 'development') {
                userData.role = role;
            }
        }

        const user = new User(userData);
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            access_token: token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Input validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const cleanUsername = sanitizeInput(username);

        // Find user
        const user = await User.findOne({ username: cleanUsername });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            access_token: token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Logout user (client-side token removal)
const logoutUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logout successful. Please remove token from client.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
};