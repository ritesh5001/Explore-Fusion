const express = require('express');
const controller = require('../controllers/postController');
const { protect } = require('../../auth/middleware/authMiddleware');

const router = express.Router();

router.get('/', controller.getPosts);
router.get('/user/:userId/count', controller.getPostsCountByUser);
router.get('/user/:userId', controller.getPostsByUser);
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'post', env: process.env.NODE_ENV });
});
router.get('/:id', controller.getPostById);

router.post('/', protect, controller.createPost);
router.put('/:id', protect, controller.updatePost);
router.delete('/:id', protect, controller.deletePost);
router.post('/:id/like', protect, controller.toggleLike);
router.post('/:id/comment', protect, controller.addComment);

module.exports = router;
