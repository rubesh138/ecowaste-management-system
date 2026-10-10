const express = require('express');

const router = express.Router();

const {
  createCollection,
  getMyCollections,
  getAllCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  getCollectionSummary,
} = require('../controllers/collectionController');

const { protect } = require('../middleware/authMiddleware');

const { authorize } = require('../middleware/roleMiddleware');


// =====================================================
// EMPLOYEE ROUTES
// =====================================================

// Create collection record
router.post(
  '/',
  protect,
  authorize('employee'),
  createCollection
);


// Get logged-in employee's own collection records
router.get(
  '/my',
  protect,
  authorize('employee'),
  getMyCollections
);


// =====================================================
// ADMIN ROUTES
// =====================================================

// IMPORTANT:
// Keep /all and /summary BEFORE /:id

// Get ALL employee collection records
router.get(
  '/all',
  protect,
  authorize('admin'),
  getAllCollections
);


// Get collection totals for each employee
router.get(
  '/summary',
  protect,
  authorize('admin'),
  getCollectionSummary
);


// Get one collection record
router.get(
  '/:id',
  protect,
  authorize('admin'),
  getCollectionById
);


// Edit collection record
router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateCollection
);


// Delete collection record
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCollection
);


module.exports = router;