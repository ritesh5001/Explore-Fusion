const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  createPackage,
  createBooking,
  getMyBookings
} = require('../controllers/bookingController');
router.get('/packages', getAllPackages);
router.post('/packages', createPackage);
router.post('/bookings', createBooking);
router.post('/bookings/my', getMyBookings);

module.exports = router;