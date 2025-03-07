const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  hireDate: { type: Date, required: true },
  salary: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Activo', 'Inactivo'], 
    default: 'Activo' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);