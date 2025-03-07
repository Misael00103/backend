const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { body, validationResult } = require('express-validator');

// Obtener todos los empleados
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error al obtener empleados' });
  }
});

// Crear nuevo empleado
router.post('/', [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').notEmpty().withMessage('El teléfono es requerido'),
  body('position').notEmpty().withMessage('El cargo es requerido'),
  body('department').notEmpty().withMessage('El departamento es requerido'),
  body('hireDate').isISO8601().withMessage('Fecha de contratación inválida'),
  body('salary').isNumeric().withMessage('El salario debe ser un número'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
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

    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(400).json({ message: 'Error al crear empleado' });
  }
});

// Actualizar empleado
router.put('/:id', async (req, res) => {
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
    console.error('Error al actualizar empleado:', error);
    res.status(400).json({ message: 'Error al actualizar empleado' });
  }
});

// Eliminar empleado
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Empleado no encontrado' });
    
    await Employee.deleteOne({ _id: req.params.id });
    res.json({ message: 'Empleado eliminado' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ message: 'Error al eliminar empleado' });
  }
});

// Obtener departamentos
router.get('/departments', async (req, res) => {
  try {
    // Primero intentamos obtener los departamentos de la base de datos
    let departments = await Department.find().sort({ name: 1 });
    
    // Si no hay departamentos en la base de datos, usamos los predeterminados
    if (departments.length === 0) {
      departments = [
        { name: "Desarrollo", budget: 720000 },
        { name: "Diseño", budget: 336000 },
        { name: "Administración", budget: 300000 },
        { name: "Calidad", budget: 240000 },
        { name: "Ventas", budget: 350000 },
      ];
    }
    
    // Calculamos empleados por departamento
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
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ message: 'Error al obtener departamentos' });
  }
});

// Obtener estadísticas de empleados
router.get('/stats', async (req, res) => {
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
    console.error('Error al obtener estadísticas de empleados:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de empleados' });
  }
});

module.exports = router;