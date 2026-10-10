const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createComplaint)
  .get(protect, getComplaints);

router.route('/:id')
  .get(protect, getComplaintById)
  .put(protect, authorize('admin'), updateComplaint);

module.exports = router;
