const User = require('../models/User');
const bcrypt = require('bcryptjs'); 

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key'; // nên lưu trong process.env.JWT_SECRET

// LOGIN user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // tìm user theo email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // so sánh password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' } // token hết hạn 1 ngày
    );

    // trả token trong header và body
    res.header('x-auth-token', token).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 
// REGISTER new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // kiểm tra email đã tồn tại chưa
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
    const savedUser = await user.save();

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};  
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { registerUser, loginUser, getMe };

