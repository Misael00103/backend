const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new client
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('company').trim().notEmpty().withMessage('Company is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const client = new Client({
        ...req.body,
        status: 'Activo' // Default status
      });
      await client.save();
      res.status(201).json(client);
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update a client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;