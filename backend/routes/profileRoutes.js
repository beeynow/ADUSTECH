const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authmiddleware = require('../middleware/authmiddleware');

// Get user profile (protected)
router.get('/profile', authmiddleware, profileController.getProfile);

// Update user profile (protected)
router.put('/profile', authmiddleware, profileController.updateProfile);

// Upload profile image (protected)
router.post('/profile/image', authmiddleware, profileController.uploadProfileImage);

module.exports = router;
