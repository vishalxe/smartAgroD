const express = require('express');
const router = express.Router();
const { 
    firebaseLogin, 
    mockLogin, 
    login,
    logout, 
    getCurrentUser, 
    updateProfile, 
    getAuthStatus, 
    registerUser,
    getFirebaseConfig
} = require('../controllers/authController');
const { verifyToken, requireAuth } = require('../middleware/auth');

// General login endpoint that handles different user roles
router.post('/login', login);

// Firebase authentication routes
router.post('/firebase/login', firebaseLogin);
router.post('/mock/login', mockLogin); // For development when Firebase is not configured
router.post('/register', registerUser);
router.post('/logout', logout);

// User profile routes
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.get('/status', getAuthStatus);
router.get('/firebase-config', getFirebaseConfig);

// Session-based routes for traditional web app
router.get('/session/me', requireAuth, getCurrentUser);
router.put('/session/profile', requireAuth, updateProfile);

module.exports = router; 