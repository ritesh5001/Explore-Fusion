const express = require('express');
const router = express.Router();
const { planTrip, findBuddy } = require('../controllers/aiController');

router.post('/plan', planTrip);
router.post('/match', findBuddy);

module.exports = router;