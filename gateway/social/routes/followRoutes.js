const express = require('express');
const router = express.Router();
const { protect } = require('../../auth/middleware/authMiddleware');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('../controllers/followController');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'social', env: process.env.NODE_ENV });
});

router.post('/follow/:id', protect, followUser);
router.delete('/unfollow/:id', protect, unfollowUser);
router.get('/followers/:id', protect, getFollowers);
router.get('/following/:id', protect, getFollowing);

module.exports = router;
