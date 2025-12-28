
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const cors = require('cors');

// Connect to MongoDB
connectDB();

// Env sanity logs (non-sensitive)
if (!process.env.POWER_ADMIN_EMAIL) {
  console.warn('⚠️ POWER_ADMIN_EMAIL is not set in .env. No power admin will be auto-assigned.');
} else {
  console.log(`🔐 POWER_ADMIN_EMAIL configured: ${process.env.POWER_ADMIN_EMAIL}`);
}

const app = express();

// CORS Configuration - Allow frontend to communicate with backend
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true, // Allow cookies to be sent
}));

app.use(express.json({ limit: '15mb' })); // Middleware to parse JSON (support base64 images)
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Session Configuration
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  }
}));

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postsRoutes = require('./routes/postsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', postsRoutes);

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));