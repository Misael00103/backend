const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://arkit.site' }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Rutas
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/requests', authMiddleware, requestRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));