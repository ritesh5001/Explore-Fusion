const express = require('express');
const router = express.Router();

const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  searchPackages,
} = require('../controllers/packageController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllPackages);
router.get('/search', searchPackages);
router.get('/:id', getPackageById);
router.post('/', protect, createPackage);
router.put('/:id', protect, updatePackage);
router.delete('/:id', protect, deletePackage);

module.exports = router;