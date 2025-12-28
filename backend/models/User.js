const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String }, // OTP for verification
    otpExpiry: { type: Date }, //Expiry time for OTP
    isVerified: { type: Boolean, default: false }, //Email verification status
    
    // Profile Information
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    level: { type: String, default: '' },
    department: { type: String, default: '' },
    faculty: { type: String, default: '' },
    phone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    address: { type: String, default: '' },
    country: { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
