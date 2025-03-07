// models/invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  client: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pendiente', 'Pagado', 'Vencido'], 
    default: 'Pendiente' 
  },
  service: { type: String, required: true },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',
    required: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);