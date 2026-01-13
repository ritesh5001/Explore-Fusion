const express = require('express');
const router = express.Router();

const {
  upsertProfile,
  getMyProfile,
  getSuggestions,
  sendRequest,
  acceptRequest,
  rejectRequest,
  getMyMatches,
  getIncomingRequests,
} = require('../controllers/buddyController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/profile', upsertProfile);
router.get('/profile/me', getMyProfile);
router.get('/suggestions', getSuggestions);

router.post('/:userId/request', sendRequest);
router.post('/:matchId/accept', acceptRequest);
router.post('/:matchId/reject', rejectRequest);

router.get('/my', getMyMatches);
router.get('/requests', getIncomingRequests);

module.exports = router;
