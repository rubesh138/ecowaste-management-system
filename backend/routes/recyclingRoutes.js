const express = require('express');

const router = express.Router();

const {
  getRecyclingRecords,
  createRecyclingRecord,
  updateRecyclingRecord,
  deleteRecyclingRecord,
  getWasteInventory,
} = require('../controllers/recyclingController');

const { protect } = require('../middleware/authMiddleware');

const { authorize } = require('../middleware/roleMiddleware');


// Get all recycling records
router.get(
  '/',
  protect,
  authorize('admin'),
  getRecyclingRecords
);


// Get current waste inventory
// IMPORTANT: keep this BEFORE /:id
router.get(
  '/inventory',
  protect,
  authorize('admin'),
  getWasteInventory
);


// Create recycling record
router.post(
  '/',
  protect,
  authorize('admin'),
  createRecyclingRecord
);


// Update recycling record
router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateRecyclingRecord
);


// Delete recycling record
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteRecyclingRecord
);


module.exports = router;