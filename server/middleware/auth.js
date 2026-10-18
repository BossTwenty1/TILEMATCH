const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!/^[a-f0-9]{64}$/i.test(JWT_SECRET || '') || new Set(JWT_SECRET.toLowerCase()).size < 8) {
  throw new Error('JWT_SECRET must be 32 random bytes encoded as 64 hexadecimal characters.');
}

// Verify JWT token - protects routes requiring authentication
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Verify user is admin
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30m' } // FR: 30-minute session timeout
  );
};

module.exports = { authenticate, authorizeAdmin, generateToken };
