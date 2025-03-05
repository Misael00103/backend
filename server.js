require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const authMiddleware = require('./middleware/auth');
const { body, validationResult } = require('express-validator');
const Request = require('./models/Request');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' })); // Permitir solicitudes desde cualquier origen

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Ruta POST pública para /api/requests
app.post('/api/requests', [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Correo electrónico inválido'),
  body('phone').notEmpty().withMessage('El teléfono es requerido'),
  body('description').notEmpty().withMessage('La descripción es requerida'),
], async (req, res) => {
  console.log('Solicitud POST pública a /api/requests recibida:', req.body);

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

// Rutas protegidas (GET, PUT, DELETE, etc.)
app.use('/api/requests', authMiddleware, requestRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));