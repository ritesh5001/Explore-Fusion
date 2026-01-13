const express = require('express');
const router = express.Router();

const {
  createItinerary,
  getMyItineraries,
  getItineraryById,
  deleteItinerary,
  getAllItineraries,
} = require('../controllers/itineraryController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createItinerary);
router.get('/my', getMyItineraries);
router.get('/', getAllItineraries);
router.get('/:id', getItineraryById);
router.delete('/:id', deleteItinerary);

module.exports = router;
