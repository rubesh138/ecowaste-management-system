const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getRequestsAnalytics,
  getWasteAnalytics,
  getRecyclingAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, getDashboardSummary);
router.get('/requests', protect, authorize('admin'), getRequestsAnalytics);
router.get('/waste', protect, authorize('admin'), getWasteAnalytics);
router.get('/recycling', protect, authorize('admin'), getRecyclingAnalytics);

module.exports = router;
