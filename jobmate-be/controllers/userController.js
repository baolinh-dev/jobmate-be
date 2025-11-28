const User = require('../models/User');
const bcrypt = require('bcryptjs'); 

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // nên lưu trong process.env.JWT_SECRET

// LOGIN user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // Send token in HttpOnly cookie and return it in the response body as well
    // (returning token allows SPA clients on different origins to store the token
    // and send it via header when cookies are unavailable or blocked)
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // chỉ HTTPS trong prod
        sameSite: "strict", // hoặc 'lax'
        maxAge: 3600000 // 1 giờ
      })
      .json({
        message: "Login successful",
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
  } catch(err) {
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

