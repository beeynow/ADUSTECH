

const User = require("../models/User");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'myusman137@gmail.com',
        pass: 'hvnqfgiaiamyskui'
    }
});

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
        
        let user = await User.findOne({ email });

        if (user) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ message: 'User already exists'});
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user = new User({ name, email, password, otp, otpExpiry });
        await user.save();
        
        console.log('✅ User saved to database');
        console.log('📧 OTP generated:', otp, '(for testing - check this in console)');

        try {
            await transporter.sendMail({
                from: 'myusman137@gmail.com',
                to: email,
                subject: 'OTP Verification',
                text: `Your OTP is: ${otp}`
            });
            console.log('✅ Email sent successfully');
        } catch (emailError) {
            console.error('⚠️ Email sending failed (user created, but email not sent):', emailError.message);
            // Don't fail registration if email fails
        }

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

        await transporter.sendMail({
            from: 'myusman137@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        });

        res.json({ message: 'OTP resend successfully' });
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
        if (user.password !== password) return res.status(400).json({ message: 'Incorrect password'});

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
