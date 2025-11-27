require('dotenv').config();  
const PORT = process.env.PORT;

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes')); // thêm route jobs
app.use('/api/categories', require('./routes/categoryRoutes')); 
app.use('/api/applications', require('./routes/applicationRoutes'));
// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
