const express = require('express');

const makeBuddyRoutes = ({ controller, auth }) => {
  if (!controller) {
    throw new Error('Buddy routes require a controller');
  }
  if (!auth?.protect) {
    throw new Error('Buddy routes require auth.protect middleware');
  }

  const router = express.Router();
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'matches', env: process.env.NODE_ENV });
  });

  router.use(auth.protect);

  router.post('/profile', controller.upsertProfile);
  router.get('/profile/me', controller.getMyProfile);
  router.get('/suggestions', controller.getSuggestions);

  router.post('/:userId/request', controller.sendRequest);
  router.post('/:matchId/accept', controller.acceptRequest);
  router.post('/:matchId/reject', controller.rejectRequest);

  router.get('/my', controller.getMyMatches);
  router.get('/requests', controller.getIncomingRequests);

  return router;
};

module.exports = { makeBuddyRoutes };
