require('dotenv').config();
const PORT = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect database
connectDB();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configuration để gửi cookie từ frontend
app.use(cors({
  origin: "http://localhost:3000", // frontend domain
  credentials: true // cho phép gửi cookie HttpOnly
}));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
