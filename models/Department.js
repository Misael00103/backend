// models/department.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  budget: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);