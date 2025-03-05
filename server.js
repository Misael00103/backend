require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const requestRoutes = require('./routes/requests');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(cors({ origin: ['*', '*'] }));

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Rutas públicas
app.use('/api/auth', authRoutes); // Autenticación
app.post('/api/requests', (req, res, next) => {
  console.log('Solicitud POST a /api/requests recibida'); // Depuración
  requestRoutes(req, res, next); // Ejecuta la lógica de POST sin auth
});

// Rutas protegidas (GET, PUT, DELETE, etc.)
app.use('/api/requests', authMiddleware, requestRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));