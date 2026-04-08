const express = require('express');
const controller = require('../controllers/adminController');
const { protect, isAdmin, isSuperAdmin } = require('../../auth/middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, isAdmin, controller.dashboard);

router.get('/users', protect, isAdmin, controller.listUsers);
router.put('/users/:id/block', protect, isAdmin, controller.blockUser);
router.put('/users/:id/unblock', protect, isAdmin, controller.unblockUser);
router.put('/users/:id/role', protect, isAdmin, controller.updateUserRole);
router.delete('/users/:id', protect, isSuperAdmin, controller.deleteUser);

router.get('/creators', protect, isAdmin, controller.listCreators);
router.put('/creators/:id/verify', protect, isAdmin, controller.verifyCreator);

router.get('/bookings', protect, isAdmin, controller.listBookings);
router.put('/bookings/:id/cancel', protect, isAdmin, controller.cancelBooking);

router.get('/reports/system', protect, isSuperAdmin, controller.systemReport);

module.exports = router;
