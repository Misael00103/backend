// routes/employees.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const auth = require('../middleware/auth');

// Obtener todos los empleados
router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nuevo empleado
router.post('/', auth, async (req, res) => {
  const employee = new Employee({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    position: req.body.position,
    department: req.body.department,
    hireDate: req.body.hireDate,
    salary: req.body.salary,
    status: req.body.status || 'Activo'
  });

  try {
    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar empleado
router.put('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Empleado no encontrado' });
    
    if (req.body.name) employee.name = req.body.name;
    if (req.body.email) employee.email = req.body.email;
    if (req.body.phone) employee.phone = req.body.phone;
    if (req.body.position) employee.position = req.body.position;
    if (req.body.department) employee.department = req.body.department;
    if (req.body.hireDate) employee.hireDate = req.body.hireDate;
    if (req.body.salary) employee.salary = req.body.salary;
    if (req.body.status) employee.status = req.body.status;
    
    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar empleado
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Empleado no encontrado' });
    
    await employee.remove();
    res.json({ message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener departamentos
router.get('/departments', auth, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    
    // Calcular empleados por departamento
    const departmentsWithStats = await Promise.all(departments.map(async (dept) => {
      const employeeCount = await Employee.countDocuments({ 
        department: dept.name,
        status: 'Activo'
      });
      
      return {
        name: dept.name,
        budget: dept.budget,
        employeeCount
      };
    }));
    
    res.json(departmentsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener estadísticas de empleados
router.get('/stats', auth, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Activo' });
    
    const salaryStats = await Employee.aggregate([
      { $match: { status: 'Activo' } },
      { 
        $group: { 
          _id: null, 
          totalSalaries: { $sum: '$salary' },
          avgSalary: { $avg: '$salary' }
        } 
      }
    ]);
    
    const departmentStats = await Employee.aggregate([
      { $match: { status: 'Activo' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalEmployees,
      activeEmployees,
      salaryStats: salaryStats.length > 0 ? salaryStats[0] : { totalSalaries: 0, avgSalary: 0 },
      departmentStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;