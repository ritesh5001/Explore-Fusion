const express = require('express');
const router = express.Router();

const {
	getPosts,
	createPost,
	getPostById,
	updatePost,
	deletePost,
	toggleLike,
	addComment,
	getPostsByUser,
	getPostsCountByUser,
} = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.get('/user/:userId/count', getPostsCountByUser);
router.get('/user/:userId', getPostsByUser);
router.get('/:id', getPostById);

router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);

module.exports = router;
