const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');

router.post('/', [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Correo electrónico inválido'),
  body('phone').notEmpty().withMessage('El teléfono es requerido'),
  body('description').notEmpty().withMessage('La descripción es requerida'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const request = new Request(req.body);
    await request.save();
    res.status(201).json({ message: 'Solicitud creada exitosamente', request });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ message: 'Error al crear la solicitud' });
  }
});


// Get all requests (para DashboardSolicitudes)
router.get('/', async (req, res) => {
  res.send('/api/requests');
  try {
    const { status, service, search } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (service && service !== 'all') query.service = service;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Fetching all requests with query:', query);
    const requests = await Request.find(query)
      .sort({ date: -1 })
      .select('name email phone service description status date'); // Añadimos 'phone'
    console.log('Requests fetched:', requests);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Nuevo', 'Contactado', 'En proceso', 'Completado', 'Cancelado'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid or missing status' });
    }

    console.log(`Updating request ${req.params.id} with status:`, status);
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.log('Request updated:', request);
    res.json(request);
  } catch (error) {
    console.error('Error updating request:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Deleting request ${req.params.id}`);
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    console.log('Request deleted:', request);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching stats endpoint started...');
    const totalRequests = await Request.countDocuments();
    const statusBreakdown = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const serviceBreakdown = await Request.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } }
    ]);
    const sourceBreakdown = await Request.aggregate([
      { $group: { _id: '$foundUs', count: { $sum: 1 } } }
    ]);
    const activeClients = 0; // Mockeado hasta integrar Client
    const responseTime = await Request.aggregate([
      { $match: { status: 'Contactado' } },
      { $project: { duration: { $subtract: ['$updatedAt', '$createdAt'] } } },
      { $group: { _id: null, avgTime: { $avg: '$duration' } } }
    ]);

    const responseData = {
      totalRequests,
      statusBreakdown,
      serviceBreakdown,
      sourceBreakdown,
      activeClients,
      avgResponseTime: responseTime[0]?.avgTime || 0
    };
    console.log('Sending stats response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching stats:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent requests (para Dashboard)
router.get('/recent', async (req, res) => {
  try {
    console.log('Fetching recent requests...');
    const recent = await Request.find()
      .sort({ date: -1 })
      .limit(10)
      .select('name service phone description date status'); // Añadimos 'phone'
    console.log('Recent requests sent:', recent);
    res.json(recent);
  } catch (error) {
    console.error('Error fetching recent requests:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;