const express = require('express');
const controller = require('../controllers/packageController');
const { protect } = require('../../auth/middleware/authMiddleware');

const router = express.Router();

router.get('/', controller.getAllPackages);
router.get('/search', controller.searchPackages);
router.get('/:id', controller.getPackageById);
router.post('/', protect, controller.createPackage);
router.put('/:id', protect, controller.updatePackage);
router.delete('/:id', protect, controller.deletePackage);

module.exports = router;
