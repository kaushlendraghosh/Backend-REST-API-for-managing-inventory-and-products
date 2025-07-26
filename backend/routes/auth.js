const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
} = require('../controllers/authController');


router.post('/register', registerUser);


router.post('/login', loginUser);


router.get('/me', authMiddleware, getCurrentUser);


router.post('/logout', authMiddleware, logoutUser);

module.exports = router;