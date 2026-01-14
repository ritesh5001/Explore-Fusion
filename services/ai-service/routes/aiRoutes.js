const express = require('express');
const router = express.Router();
const {
	planTrip,
	findBuddy,
	listModels,
	generateItinerary,
	chatSupport,
} = require('../controllers/aiController');

router.post('/generate-itinerary', generateItinerary);
router.post('/chat', chatSupport);
// Backward-compatible alias (older frontend used /support-chat)
router.post('/support-chat', chatSupport);

router.post('/plan', planTrip);
router.post('/match', findBuddy);
router.get('/models', listModels);

module.exports = router;