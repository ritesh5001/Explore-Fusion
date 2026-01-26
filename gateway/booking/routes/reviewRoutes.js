const express = require('express');

const makeReviewRoutes = ({ controller, auth }) => {
  if (!controller) {
    throw new Error('Review routes require a controller');
  }
  if (!auth?.protect) {
    throw new Error('Review routes require auth.protect middleware');
  }

  const router = express.Router();

  router.get('/:packageId', controller.getReviewsByPackage);
  router.post('/', auth.protect, controller.createReview);
  router.delete('/:id', auth.protect, controller.deleteReview);

  return router;
};

module.exports = { makeReviewRoutes };
