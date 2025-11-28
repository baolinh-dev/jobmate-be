const jwt = require("jsonwebtoken");

const requireLogin = (req, res, next) => {
  // Support token from HttpOnly cookie (preferred) or from x-auth-token header
  // (header is useful for SPA clients that store the token in localStorage during development)
  const token = req.cookies?.token || req.headers['x-auth-token'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if(!token) return res.status(401).json({ message: "Authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = requireLogin;
