const express = require('express');
const rateLimit = require('express-rate-limit');

const { protect } = require('../middleware/authMiddleware');
const { getImagekitAuth } = require('../controllers/imagekitController');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

router.post('/imagekit-auth', limiter, getImagekitAuth);

module.exports = router;
