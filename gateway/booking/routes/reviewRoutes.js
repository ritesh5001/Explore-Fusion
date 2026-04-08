const express = require('express');
const controller = require('../controllers/reviewController');
const { protect } = require('../../auth/middleware/authMiddleware');

const router = express.Router();

router.get('/:packageId', controller.getReviewsByPackage);
router.post('/', protect, controller.createReview);
router.delete('/:id', protect, controller.deleteReview);

module.exports = router;
