const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  company: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Activo', 'Inactivo'], 
    default: 'Activo' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);