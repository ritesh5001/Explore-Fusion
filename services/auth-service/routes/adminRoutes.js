const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const isSuperAdmin = require('../middleware/isSuperAdmin');
const {
  getAllUsers,
  updateUserRole,
  toggleBlockUser
} = require('../controllers/adminController');

router.get('/users', protect, isSuperAdmin, getAllUsers);
router.patch('/users/:id/role', protect, isSuperAdmin, updateUserRole);
router.patch('/users/:id/block', protect, isSuperAdmin, toggleBlockUser);

module.exports = router;