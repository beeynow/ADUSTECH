

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
const { sendRoleChangeEmail } = require('../utils/sendEmail');

const POWER_ADMIN_EMAIL = process.env.POWER_ADMIN_EMAIL || '';

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

        const role = email === POWER_ADMIN_EMAIL ? 'power' : 'user';
        const user = new User({ name, email, password: hashedPassword, otp, otpExpiry, role });
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
        req.session.user = { id: user._id, email: user.email, name: user.name, role: user.role };
        
        // Return user data along with success message
        res.status(200).json({ 
            message: 'Login successful', 
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name,
                role: user.role,
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

// Create Admin (power admin only)
exports.createAdmin = async (req, res) => {
    try {
        const requester = req.session.user;
        if (!requester || requester.role !== 'power') {
            return res.status(403).json({ message: 'Forbidden: Only power admin can create admins' });
        }

        const { email, name, password, role } = req.body;
        if (!email || !name || !password || !role) {
            return res.status(400).json({ message: 'name, email, password and role are required' });
        }
        if (!['admin', 'd-admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Allowed: admin, d-admin' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            // Enforce single position per email
            if (existing.role !== 'user') {
                return res.status(400).json({ message: 'This email already has a position assigned' });
            }
            existing.name = name;
            existing.password = await bcrypt.hash(password, 10);
            const previousRole = existing.role || 'user';
            existing.role = role;
            existing.isVerified = true; // Admins assumed verified by creator
            await existing.save();
            // Notify user of role change
            await sendRoleChangeEmail(existing.email, existing.name, previousRole, role);
            return res.json({ message: 'User promoted to admin successfully', user: { id: existing._id, email: existing.email, name: existing.name, role: existing.role } });
        }

        const hashed = await bcrypt.hash(password, 10);
        const newAdmin = new User({ name, email, password: hashed, role, isVerified: true });
        await newAdmin.save();
        // Notify user of role change
        await sendRoleChangeEmail(newAdmin.email, newAdmin.name, 'user', role);
        return res.status(201).json({ message: 'Admin created successfully', user: { id: newAdmin._id, email: newAdmin.email, name: newAdmin.name, role: newAdmin.role } });
    } catch (error) {
        console.error('Create admin error', error);
        res.status(500).json({ message: 'Error creating admin' });
    }
};

// List Admins (power admin only)
exports.listAdmins = async (req, res) => {
    try {
        const requester = req.session.user;
        if (!requester || requester.role !== 'power') {
            return res.status(403).json({ message: 'Forbidden: Only power admin can list admins' });
        }
        const admins = await User.find({ role: { $in: ['power', 'admin', 'd-admin'] } }).select('_id name email role createdAt');
        res.json({ admins });
    } catch (error) {
        console.error('List admins error', error);
        res.status(500).json({ message: 'Error listing admins' });
    }
};

// Demote Admin to user (power admin only)
exports.demoteAdmin = async (req, res) => {
    try {
        const requester = req.session.user;
        if (!requester || requester.role !== 'power') {
            return res.status(403).json({ message: 'Forbidden: Only power admin can demote admins' });
        }
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'user') return res.status(400).json({ message: 'User is not an admin' });
        // Prevent demoting the primary power admin
        if (user.role === 'power' && email === POWER_ADMIN_EMAIL) {
            return res.status(400).json({ message: 'Cannot demote the primary power admin' });
        }
        const previousRole = user.role;
        user.role = 'user';
        await user.save();
        // Notify user of role change
        await sendRoleChangeEmail(user.email, user.name, previousRole, 'user');
        res.json({ message: 'Admin demoted to user successfully' });
    } catch (error) {
        console.error('Demote admin error', error);
        res.status(500).json({ message: 'Error demoting admin' });
    }
};
