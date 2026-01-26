const express = require('express');

const makeBookingRoutes = ({ controller, auth }) => {
  if (!controller) {
    throw new Error('Booking routes require a controller');
  }
  if (!auth?.protect) {
    throw new Error('Booking routes require auth.protect middleware');
  }

  const router = express.Router();
  router.use(auth.protect);

  router.post('/', controller.createBooking);
  router.get('/my', controller.getMyBookings);
  router.get('/', controller.getAllBookings);
  router.get('/:id', controller.getBookingById);
  router.put('/:id/cancel', controller.cancelBooking);
  router.put('/:id/status', controller.updateBookingStatus);
  router.delete('/:id', auth.isSuperAdmin, controller.deleteBooking);

  return router;
};

module.exports = { makeBookingRoutes };
