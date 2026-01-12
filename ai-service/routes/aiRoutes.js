const express = require('express');
const router = express.Router();
const { planTrip, findBuddy, listModels } = require('../controllers/aiController');

router.post('/plan', planTrip);
router.post('/match', findBuddy);
router.get('/models', listModels);

module.exports = router;