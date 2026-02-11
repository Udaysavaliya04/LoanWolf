const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || !payload.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(payload.userId).select('_id email name');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { id: user._id.toString(), email: user.email, name: user.name };
    next();
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

module.exports = requireAuth;

