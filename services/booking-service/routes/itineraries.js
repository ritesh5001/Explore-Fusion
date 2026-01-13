const express = require('express');
const router = express.Router();

const {
  saveItinerary,
  getUserItineraries
} = require('../controllers/itineraryController');

router.post('/', saveItinerary);
router.get('/my', getUserItineraries);

module.exports = router;