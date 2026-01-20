// routes/auth.js
const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  changePassword, // Added this
  getUsers 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword); // Added this route
router.get('/users',  getUsers); // Added protect and admin middleware

module.exports = router;