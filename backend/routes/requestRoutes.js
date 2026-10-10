const express = require('express');

const router = express.Router();

const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  acceptRequest,
  rejectRequest,
  scheduleRequest,
  assignEmployee,
  collectRequest,
  updateStatus,
  updateAdminResponse,
} = require('../controllers/requestController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// =====================================================
// BASIC REQUEST ROUTES
// =====================================================

// Citizen creates request
// Admin/Employee/Citizen can get requests based on their role
router
  .route('/')
  .post(protect, createRequest)
  .get(protect, getRequests);

// Get, update and delete single request
router
  .route('/:id')
  .get(protect, getRequestById)
  .put(protect, updateRequest)
  .delete(protect, deleteRequest);

// =====================================================
// ADMIN REQUEST ACTIONS
// =====================================================

// Accept request
router.put(
  '/:id/accept',
  protect,
  authorize('admin'),
  acceptRequest
);

// Reject request
router.put(
  '/:id/reject',
  protect,
  authorize('admin'),
  rejectRequest
);

// Schedule request
router.put(
  '/:id/schedule',
  protect,
  authorize('admin'),
  scheduleRequest
);

// Assign employee
router.put(
  '/:id/assign',
  protect,
  authorize('admin'),
  assignEmployee
);

// Update request status
router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  updateStatus
);

// Update admin response
router.put(
  '/:id/response',
  protect,
  authorize('admin'),
  updateAdminResponse
);

// =====================================================
// EMPLOYEE ACTION
// =====================================================

// Employee marks assigned request as collected
// This automatically creates a Collection record
router.put(
  '/:id/collect',
  protect,
  authorize('employee'),
  collectRequest
);

module.exports = router;