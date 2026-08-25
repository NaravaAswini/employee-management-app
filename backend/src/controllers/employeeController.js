import { getPool, isFallbackMode, mockData } from '../config/db.js';
import { validateEmail } from './authController.js';

function validateEmployeeInput(data) {
  const errors = [];
  const { name, email, phone, department, salary } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.message);
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
    errors.push('Valid phone number is required (at least 5 digits).');
  }

  if (!department || typeof department !== 'string' || department.trim().length === 0) {
    errors.push('Department is required.');
  }

  const numSalary = Number(salary);
  if (isNaN(numSalary) || numSalary < 0) {
    errors.push('Salary must be a positive number.');
  }

  return errors;
}

// GET /api/employees
export async function getEmployees(req, res, next) {
  try {
    const { search, department } = req.query;

    if (isFallbackMode()) {
      let results = [...mockData.employees];

      if (department && department !== 'All') {
        results = results.filter(e => e.department.toLowerCase() === department.toLowerCase());
      }

      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        results = results.filter(e =>
          e.name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.department.toLowerCase().includes(query) ||
          e.phone.toLowerCase().includes(query)
        );
      }

      // Sort newest first
      results.sort((a, b) => b.id - a.id);

      return res.json({
        success: true,
        count: results.length,
        data: results
      });
    }

    const pool = getPool();
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (department && department !== 'All') {
      query += ' AND department = ?';
      params.push(department);
    }

    if (search && search.trim()) {
      query += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ? OR phone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY id DESC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/employees/:id
export async function getEmployeeById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID.' });
    }

    if (isFallbackMode()) {
      const employee = mockData.employees.find(e => e.id === id);
      if (!employee) {
        return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
      }
      return res.json({ success: true, data: employee });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// POST /api/employees
export async function createEmployee(req, res, next) {
  try {
    const { name, email, phone, department, salary } = req.body;

    const validationErrors = validateEmployeeInput({ name, email, phone, department, salary });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors[0],
        errors: validationErrors
      });
    }

    const cleanData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department: department.trim(),
      salary: parseFloat(salary)
    };

    if (isFallbackMode()) {
      const newEmployee = {
        id: mockData.nextEmployeeId++,
        ...cleanData,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockData.employees.unshift(newEmployee);

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully!',
        data: newEmployee
      });
    }

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO employees (name, email, phone, department, salary) VALUES (?, ?, ?, ?, ?)',
      [cleanData.name, cleanData.email, cleanData.phone, cleanData.department, cleanData.salary]
    );

    const [created] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully!',
      data: created[0]
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/employees/:id
export async function updateEmployee(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID.' });
    }

    const { name, email, phone, department, salary } = req.body;

    const validationErrors = validateEmployeeInput({ name, email, phone, department, salary });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors[0],
        errors: validationErrors
      });
    }

    const cleanData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department: department.trim(),
      salary: parseFloat(salary)
    };

    if (isFallbackMode()) {
      const index = mockData.employees.findIndex(e => e.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
      }

      mockData.employees[index] = {
        ...mockData.employees[index],
        ...cleanData,
        updated_at: new Date()
      };

      return res.json({
        success: true,
        message: 'Employee updated successfully!',
        data: mockData.employees[index]
      });
    }

    const pool = getPool();
    const [check] = await pool.query('SELECT id FROM employees WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
    }

    await pool.query(
      'UPDATE employees SET name = ?, email = ?, phone = ?, department = ?, salary = ? WHERE id = ?',
      [cleanData.name, cleanData.email, cleanData.phone, cleanData.department, cleanData.salary, id]
    );

    const [updated] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Employee updated successfully!',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/employees/:id
export async function deleteEmployee(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID.' });
    }

    if (isFallbackMode()) {
      const index = mockData.employees.findIndex(e => e.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
      }

      const deleted = mockData.employees.splice(index, 1)[0];
      return res.json({
        success: true,
        message: `Employee "${deleted.name}" deleted successfully!`,
        data: { id }
      });
    }

    const pool = getPool();
    const [check] = await pool.query('SELECT id, name FROM employees WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
    }

    const employeeName = check[0].name;
    await pool.query('DELETE FROM employees WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Employee "${employeeName}" deleted successfully!`,
      data: { id }
    });
  } catch (error) {
    next(error);
  }
}
