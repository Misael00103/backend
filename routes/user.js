const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'a4f2ed8746e62877272dcc4633946cd89bc5a1c973c4f91b0439c3e78b5d04e6'; // Usa una clave segura en producción

// Registro (solo para crear un usuario inicial)
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        email,
        password: hashedPassword
      });

      await user.save();

      const payload = { userId: user._id, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ token });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const payload = { userId: user._id, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;