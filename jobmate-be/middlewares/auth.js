const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key'; // nên để trong process.env.JWT_SECRET

const requireLogin = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // chứa { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = requireLogin;
