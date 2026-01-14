const express = require('express');
const router = express.Router();

const {
  getMyProfile,
  getUserById,
  getUserProfile,
  updateMyProfile,
  deleteMyAccount,
  listUsersLight,
} = require('../controllers/userController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.delete('/me', deleteMyAccount);

router.get('/', isAdmin, listUsersLight);
router.get('/:id/profile', getUserProfile);
router.get('/:id', getUserById);

module.exports = router;
