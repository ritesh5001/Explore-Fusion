const express = require('express');
const router = express.Router();

const {
  createNotification,
  getMyNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
} = require('../controllers/notificationController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createNotification);
router.get('/my', getMyNotifications);

// Order matters: define '/clear/all' before '/:id'
router.delete('/clear/all', clearAllNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
