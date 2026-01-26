const express = require('express');

const makeItineraryRoutes = ({ controller, auth }) => {
  if (!controller) {
    throw new Error('Itinerary routes require a controller');
  }
  if (!auth?.protect) {
    throw new Error('Itinerary routes require auth.protect middleware');
  }

  const router = express.Router();
  router.use(auth.protect);

  router.post('/', controller.createItinerary);
  router.get('/my', controller.getMyItineraries);
  router.get('/', controller.getAllItineraries);
  router.get('/:id', controller.getItineraryById);
  router.delete('/:id', controller.deleteItinerary);

  return router;
};

module.exports = { makeItineraryRoutes };
