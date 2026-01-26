const express = require('express');

const makePackageRoutes = ({ controller, auth }) => {
  if (!controller) {
    throw new Error('Package routes require a controller');
  }

  const protect = auth?.protect;
  const router = express.Router();

  router.get('/', controller.getAllPackages);
  router.get('/search', controller.searchPackages);
  router.get('/:id', controller.getPackageById);
  router.post('/', protect, controller.createPackage);
  router.put('/:id', protect, controller.updatePackage);
  router.delete('/:id', protect, controller.deletePackage);

  return router;
};

module.exports = { makePackageRoutes };
