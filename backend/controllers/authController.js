

const User = require("../models/User");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { 
    sendWelcomeEmail,
    sendOtpEmail,
    sendResendOtpEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail
} = require('../utils/sendEmail');

// Generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Register User and Send OTP
exports.register = async (req, res) => {
    try {
        console.log('📝 Registration attempt:', { name: req.body.name, email: req.body.email });
        
        const { name, email, password } =  req.body;
        
        // Validate input
        if (!name || !email || !password) {
            console.log('❌ Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        let existing = await User.findOne({ email });

        if (existing) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ message: 'User already exists'});
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword, otp, otpExpiry });
        await user.save();
        
        console.log('✅ User saved to database');
        console.log('📧 OTP generated:', otp, '(for testing - check this in console)');

        // Send rich OTP email
        await sendOtpEmail(email, name, otp);

        res.status(201).json({ message: 'User registered. Please verify OTP sent to email.' });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const now = new Date();

        // Atomic verify update
        const updated = await User.findOneAndUpdate(
            { email, otp, otpExpiry: { $gte: now }, isVerified: false },
            { $set: { isVerified: true }, $unset: { otp: "", otpExpiry: "" } },
            { new: true }
        );

        if (updated) {
            // Send welcome email upon successful verification
            await sendWelcomeEmail(updated.email, updated.name);
            return res.json({ message: 'Email verified successfully. you can now log in.', isVerified: updated.isVerified });
        }

        // No match: diagnose and return precise message
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
        if (user.otpExpiry < now) return res.status(400).json({ message: 'Invalid or expired OTP' });
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
}

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } =  req.body;
        let user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found'});
        if (user.isVerified) return res.status(400).json({ message: 'User already verified'});

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendResendOtpEmail(email, user.name, otp);

        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } =  req.body;
        let user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found'});
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password'});

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify OTP.'});
        }

        // Store user session
        req.session.user = { id: user._id, email: user.email, name: user.name };
        
        // Return user data along with success message
        res.status(200).json({ 
            message: 'Login successful', 
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name 
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Logout User
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Error logging out'});
        res.json({ message: 'Logged out successfully' });
    });
};

// Dashboard (Protected Route)
exports.dashboard = async (req, res) => {
    res.json({ message: `Welcome to the dashboard, ${req.session.user.name}`, user: req.session.user });
};

// Forgot Password - generate reset code and email it
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(200).json({ message: 'If that email exists, a reset code has been sent.' });

        const resetToken = crypto.randomInt(100000, 999999).toString();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        await sendPasswordResetEmail(user.email, user.name, resetToken);
        res.json({ message: 'Password reset code sent to your email.' });
    } catch (error) {
        console.error('Forgot password error', error);
        res.status(500).json({ message: 'Error initiating password reset' });
    }
};

// Reset Password with code
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid reset request' });

        if (!user.resetPasswordToken || !user.resetPasswordExpires || user.resetPasswordToken !== token) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }
        if (user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        await sendPasswordChangedEmail(user.email, user.name);
        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// Change Password (authenticated)
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await sendPasswordChangedEmail(user.email, user.name);
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Change password error', error);
        res.status(500).json({ message: 'Error changing password' });
    }
};
