const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URL = "mongodb+srv://myusman137_db_user:nIGUdB9ZSA4dO5aT@cluster0.5vfgyc9.mongodb.net/?appName=Cluster0";

const connectDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URL);
        console.log('MongoDB Connected successfully');
        // Create the empty User collection
        await User.createCollection();
        console.log('User collection created successfully');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1); // Exit the process with failure
    }
};

connectDB();

module.exports = connectDB;
