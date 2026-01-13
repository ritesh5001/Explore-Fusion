const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getCreatorBookings
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/creator/:creatorId', getCreatorBookings);

module.exports = router;