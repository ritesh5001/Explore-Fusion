const express = require('express');

const makeAdminRoutes = ({ auth, controller }) => {
  const router = express.Router();

  router.get('/dashboard', auth.protect, auth.isAdmin, controller.dashboard);

  router.get('/users', auth.protect, auth.isAdmin, controller.listUsers);
  router.put('/users/:id/block', auth.protect, auth.isAdmin, controller.blockUser);
  router.put('/users/:id/unblock', auth.protect, auth.isAdmin, controller.unblockUser);
  router.put('/users/:id/role', auth.protect, auth.isAdmin, controller.updateUserRole);
  router.delete('/users/:id', auth.protect, auth.isSuperAdmin, controller.deleteUser);

  router.get('/creators', auth.protect, auth.isAdmin, controller.listCreators);
  router.put('/creators/:id/verify', auth.protect, auth.isAdmin, controller.verifyCreator);

  router.get('/bookings', auth.protect, auth.isAdmin, controller.listBookings);
  router.put('/bookings/:id/cancel', auth.protect, auth.isAdmin, controller.cancelBooking);

  router.get('/reports/system', auth.protect, auth.isSuperAdmin, controller.systemReport);

  return router;
};

module.exports = { makeAdminRoutes };
