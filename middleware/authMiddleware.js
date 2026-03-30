const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();

  } catch (err) {
    res.status(401).json({ success: false, error: 'Not authorized, invalid token' });
  }
};

module.exports = protect;