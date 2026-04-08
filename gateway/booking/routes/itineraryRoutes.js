const express = require('express');
const controller = require('../controllers/itineraryController');
const { protect } = require('../../auth/middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.post('/', controller.createItinerary);
router.get('/my', controller.getMyItineraries);
router.get('/', controller.getAllItineraries);
router.get('/:id', controller.getItineraryById);
router.delete('/:id', controller.deleteItinerary);

module.exports = router;
