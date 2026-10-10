const express = require('express');

const router = express.Router();

const {
  getUsers,
  getEmployees,
  getUserById,
  updateUserStatus,
  createEmployee,
  updateEmployee,
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

const { authorize } = require('../middleware/roleMiddleware');


// ============================================================
// AUTHENTICATION
// ============================================================

router.use(protect);


// ============================================================
// ADMIN ONLY
// ============================================================

router.use(authorize('admin'));


// ============================================================
// CITIZEN MANAGEMENT
// ============================================================

// Get all citizens
router.get('/', getUsers);


// ============================================================
// EMPLOYEE MANAGEMENT
// ============================================================

// Get all employees
router.get('/employees', getEmployees);

// Create a new employee
router.post('/employees', createEmployee);

// Edit employee details
router.put('/employees/:id', updateEmployee);


// ============================================================
// COMMON USER MANAGEMENT
// ============================================================

// Get single citizen / employee details
router.get('/:id', getUserById);

// Activate / deactivate citizen / employee
router.put('/:id/status', updateUserStatus);


module.exports = router;