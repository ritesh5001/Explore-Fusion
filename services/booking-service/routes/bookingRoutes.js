const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');

const { protect, isSuperAdmin } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);

router.get('/', getAllBookings);

router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/status', updateBookingStatus);
router.delete('/:id', isSuperAdmin, deleteBooking);

module.exports = router;