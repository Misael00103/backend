// routes/finance.js
const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');

// Obtener todas las facturas
router.get('/invoices', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nueva factura
router.post('/invoices', auth, async (req, res) => {
  const invoice = new Invoice({
    client: req.body.client,
    amount: req.body.amount,
    date: req.body.date,
    dueDate: req.body.dueDate,
    status: req.body.status,
    service: req.body.service,
    clientId: req.body.clientId
  });

  try {
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar factura
router.put('/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });
    
    if (req.body.client) invoice.client = req.body.client;
    if (req.body.amount) invoice.amount = req.body.amount;
    if (req.body.date) invoice.date = req.body.date;
    if (req.body.dueDate) invoice.dueDate = req.body.dueDate;
    if (req.body.status) invoice.status = req.body.status;
    if (req.body.service) invoice.service = req.body.service;
    
    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar factura
router.delete('/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });
    
    await invoice.remove();
    res.json({ message: 'Factura eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener estadísticas financieras
router.get('/stats', auth, async (req, res) => {
  try {
    const totalRevenue = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingAmount = await Invoice.aggregate([
      { $match: { status: 'Pendiente' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const overdueAmount = await Invoice.aggregate([
      { $match: { status: 'Vencido' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const revenueByService = await Invoice.aggregate([
      { $match: { status: 'Pagado' } },
      { $group: { _id: '$service', value: { $sum: '$amount' } } }
    ]);
    
    // Ingresos mensuales del año actual
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Invoice.aggregate([
      { 
        $match: { 
          status: 'Pagado',
          date: { 
            $gte: new Date(`${currentYear}-01-01`), 
            $lte: new Date(`${currentYear}-12-31`) 
          } 
        } 
      },
      {
        $group: {
          _id: { $month: '$date' },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      pendingAmount: pendingAmount.length > 0 ? pendingAmount[0].total : 0,
      overdueAmount: overdueAmount.length > 0 ? overdueAmount[0].total : 0,
      revenueByService,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;