const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  serviceType: { type: String, required: true },
  service: { type: String, required: true },
  description: { type: String, required: true },
  foundUs: { type: String, required: true },
  contactMethod: { 
    type: String, 
    required: true,
    enum: ['whatsapp', 'call'],
    default: 'whatsapp'
  },
  status: {
    type: String,
    enum: ['Nuevo', 'Contactado', 'En proceso', 'Completado', 'Cancelado'],
    default: 'Nuevo'
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);