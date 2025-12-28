
const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const cors = require('cors');

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration - Allow frontend to communicate with backend
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true, // Allow cookies to be sent
}));

app.use(express.json()); // Middleware to parse JSON

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

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));