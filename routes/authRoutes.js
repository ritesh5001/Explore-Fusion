const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

// When user hits 'POST /register', run the registerUser function
router.post('/register', registerUser);

module.exports = router;