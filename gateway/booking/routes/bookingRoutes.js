const express = require('express');
const controller = require('../controllers/bookingController');
const { protect, isSuperAdmin } = require('../../auth/middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.post('/', controller.createBooking);
router.get('/my', controller.getMyBookings);
router.get('/', controller.getAllBookings);
router.get('/:id', controller.getBookingById);
router.put('/:id/cancel', controller.cancelBooking);
router.put('/:id/status', controller.updateBookingStatus);
router.delete('/:id', isSuperAdmin, controller.deleteBooking);

module.exports = router;
