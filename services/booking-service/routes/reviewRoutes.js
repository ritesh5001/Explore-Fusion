const express = require('express');
const router = express.Router();

const {
  createReview,
  getReviewsByPackage,
  deleteReview,
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/:packageId', getReviewsByPackage);

// Protected writes
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
