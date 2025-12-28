const User = require('../models/User');

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findById(req.session.user.id).select('-password -otp -otpExpires');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            message: 'Profile retrieved successfully',
            user: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const { 
            name, 
            bio, 
            profileImage, 
            level, 
            department, 
            faculty, 
            phone, 
            dateOfBirth, 
            gender, 
            address, 
            country 
        } = req.body;

        // Find user and update profile fields
        const user = await User.findById(req.session.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (level !== undefined) user.level = level;
        if (department !== undefined) user.department = department;
        if (faculty !== undefined) user.faculty = faculty;
        if (phone !== undefined) user.phone = phone;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;
        if (address !== undefined) user.address = address;
        if (country !== undefined) user.country = country;

        await user.save();

        // Update session with new name
        req.session.user.name = user.name;

        const updatedUser = await User.findById(user._id).select('-password -otp -otpExpires');

        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

// Upload Profile Image (Base64)
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ message: 'No image provided' });
        }

        const user = await User.findById(req.session.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profileImage = imageBase64;
        await user.save();

        res.status(200).json({ 
            message: 'Profile image uploaded successfully',
            profileImage: user.profileImage
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error });
    }
};
