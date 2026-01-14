const mongoose = require('mongoose');
const Post = require('../models/Post');
require('../models/User');

const jsonSuccess = (res, status, data) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

const jsonError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const isValidId = (id) => mongoose.isValidObjectId(id);

const toUserResponse = (postDoc) => {
  const author = postDoc?.author;
  if (author && typeof author === 'object' && author._id) {
    return {
      _id: author._id,
      name: author.name,
      username: author.username,
      role: author.role,
      avatar: author.avatar,
    };
  }

  return {
    _id: postDoc.author,
    name: postDoc.authorName || undefined,
  };
};

const toPostResponse = (p) => {
  const user = toUserResponse(p);
  return {
    _id: p._id,
    title: p.title,
    content: p.content,
    location: p.location,
    imageUrl: p.imageUrl,
    imageFileId: p.imageFileId,
    imageFolder: p.imageFolder,
    // New payload expected by clients
    user,
    // Backward compatibility
    author: { _id: user._id, name: user.name },
    likesCount: p.likes?.length || 0,
    commentsCount: p.comments?.length || 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

const normalizeOptionalUrl = (value) => {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  return trimmed;
};

const normalizeOptionalString = (value) => {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  return trimmed;
};

const createPost = async (req, res) => {
  try {
    const { title, content, location, imageUrl } = req.body;

    if (!content || !location) {
      return jsonError(res, 400, 'Please provide content and location');
    }

    const safeContent = String(content).trim();
    const safeLocation = String(location).trim();
    const safeTitle = typeof title === 'string' && title.trim() ? title.trim() : `Post from ${safeLocation}`;
    const safeImageUrl = normalizeOptionalUrl(imageUrl);

    const post = await Post.create({
      title: safeTitle,
      content: safeContent,
      location: safeLocation,
      imageUrl: safeImageUrl,
      author: req.user._id,
      authorName: req.user.name,
      likes: [],
      comments: [],
    });

    return jsonSuccess(res, 201, {
      ...toPostResponse(post),
      // Create endpoint previously returned full comments array
      comments: post.comments,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const getPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitRaw = parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(Math.max(limitRaw, 1), 50);
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      Post.countDocuments({}),
      Post.find({})
        .populate('author', '_id name username role avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const items = posts.map(toPostResponse);

    return jsonSuccess(res, 200, {
      page,
      limit,
      total,
      totalPages,
      posts: items,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid post id');
    }

    const post = await Post.findById(id).populate('author', '_id name username role avatar');
    if (!post) {
      return jsonError(res, 404, 'Post not found');
    }

    return jsonSuccess(res, 200, {
      ...toPostResponse(post),
      comments: post.comments,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid post id');
    }

    const post = await Post.findById(id);
    if (!post) {
      return jsonError(res, 404, 'Post not found');
    }

    if (String(post.author) !== String(req.user._id)) {
      return jsonError(res, 403, 'Forbidden');
    }

    const { title, content, location, imageUrl, imageFileId, imageFolder } = req.body;
    if (typeof title === 'string') post.title = title.trim();
    if (typeof content === 'string') post.content = content.trim();
    if (typeof location === 'string') post.location = location.trim();
    if (typeof imageUrl === 'string') post.imageUrl = normalizeOptionalUrl(imageUrl);
    if (typeof imageFileId === 'string') post.imageFileId = normalizeOptionalString(imageFileId);
    if (typeof imageFolder === 'string') post.imageFolder = normalizeOptionalString(imageFolder);

    await post.save();

    return jsonSuccess(res, 200, {
      ...toPostResponse(post),
      comments: post.comments,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid post id');
    }

    const post = await Post.findById(id);
    if (!post) {
      return jsonError(res, 404, 'Post not found');
    }

    const isOwner = String(post.author) === String(req.user._id);
    const role = req.user?.role;
    const isAdmin = role === 'admin' || role === 'superadmin';

    if (!isOwner && !isAdmin) {
      return jsonError(res, 403, 'Forbidden');
    }

    await Post.deleteOne({ _id: post._id });
    return jsonSuccess(res, 200, { message: 'Post deleted' });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid post id');
    }

    const post = await Post.findById(id);
    if (!post) {
      return jsonError(res, 404, 'Post not found');
    }

    const userId = String(req.user._id);
    const alreadyLiked = (post.likes || []).some((l) => String(l) === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((l) => String(l) !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    return jsonSuccess(res, 200, { likesCount: post.likes.length });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid post id');
    }

    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (!text) {
      return jsonError(res, 400, 'Comment text is required');
    }

    const post = await Post.findById(id);
    if (!post) {
      return jsonError(res, 404, 'Post not found');
    }

    post.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date(),
    });

    await post.save();

    return jsonSuccess(res, 201, {
      comments: post.comments,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidId(userId)) {
      return jsonError(res, 400, 'Invalid user id');
    }

    const posts = await Post.find({ author: userId })
      .populate('author', '_id name username role avatar')
      .sort({ createdAt: -1 });

    const items = posts.map(toPostResponse);

    return jsonSuccess(res, 200, { posts: items });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// GET /api/v1/posts/user/:userId/count
const getPostsCountByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidId(userId)) {
      return jsonError(res, 400, 'Invalid user id');
    }

    const postsCount = await Post.countDocuments({ author: userId });
    return jsonSuccess(res, 200, { userId, postsCount });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getPostsByUser,
  getPostsCountByUser,
};
