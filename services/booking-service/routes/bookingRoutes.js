const express = require('express');
const router = express.Router();
const { 
  getCreatorBookings 
} = require('../controllers/bookingController');
const {
  getAllPackages,
  createPackage,
  createBooking,
  getMyBookings,
  createItinerary,
  getMyItineraries 
} = require('../controllers/bookingController');
router.get('/packages', getAllPackages);
router.post('/packages', createPackage);
router.post('/bookings', createBooking);
router.post('/bookings/my', getMyBookings);
router.post('/itineraries', createItinerary);
router.get('/itineraries/my', getMyItineraries);
router.get('/bookings/creator/:creatorId', getCreatorBookings);

module.exports = router;