
const express = require('express');
const { register, verifyOTP, resendOTP, login, logout, dashboard, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authmiddleware');
const authmiddleware = require('../middleware/authmiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authMiddleware, changePassword);
router.get('/dashboard', authMiddleware, dashboard);

module.exports = router;
