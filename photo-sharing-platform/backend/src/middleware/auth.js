const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Add user info to request
    next();
  });
};

// Middleware to check if user has creator role
const requireCreator = (req, res, next) => {
  if (req.user.role !== 'creator') {
    return res.status(403).json({ error: 'Creator access required' });
  }
  next();
};

// Middleware to check if user has consumer role
const requireConsumer = (req, res, next) => {
  if (req.user.role !== 'consumer') {
    return res.status(403).json({ error: 'Consumer access required' });
  }
  next();
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports = {
  authenticateToken,
  requireCreator,
  requireConsumer,
  generateToken,
};
