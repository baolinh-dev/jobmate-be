const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const requireLogin = require('../middlewares/auth');

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Lấy thông tin current user (chỉ user đã login mới xem được)
router.get('/me', requireLogin, getMe);

module.exports = router;
