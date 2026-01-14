const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('../controllers/followController');

// All follow endpoints require auth (keeps role enforcement consistent)
router.use(protect);

// Spec routes (mounted under /api/v1)
router.post('/follow/:id', followUser);
router.delete('/unfollow/:id', unfollowUser);
router.get('/followers/:id', getFollowers);
router.get('/following/:id', getFollowing);

module.exports = router;
