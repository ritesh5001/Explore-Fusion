const express = require('express');

const makePostRoutes = (controller) => {
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
  } = controller;

  const { protect } = require('../../auth/middleware/authMiddleware');

  router.get('/', getPosts);
  router.get('/user/:userId/count', getPostsCountByUser);
  router.get('/user/:userId', getPostsByUser);
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'post', env: process.env.NODE_ENV });
  });
  router.get('/:id', getPostById);

  router.post('/', protect, createPost);
  router.put('/:id', protect, updatePost);
  router.delete('/:id', protect, deletePost);
  router.post('/:id/like', protect, toggleLike);
  router.post('/:id/comment', protect, addComment);

  return router;
};

module.exports = makePostRoutes;
