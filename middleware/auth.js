const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'a4f2ed8746e62877272dcc4633946cd89bc5a1c973c4f91b0439c3e78b5d04e6';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;