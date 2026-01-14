const mongoose = require('mongoose');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');

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

const buildSafeSelfUser = (userDoc) => {
  return {
    _id: userDoc._id,
    name: userDoc.name,
    username: userDoc.username,
    avatar: userDoc.avatar,
    bio: userDoc.bio,
    email: userDoc.email,
    role: userDoc.role,
    isVerifiedCreator: userDoc.isVerifiedCreator,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
};

const buildPublicUser = (userDoc) => {
  return {
    _id: userDoc._id,
    name: userDoc.name,
    username: userDoc.username,
    avatar: userDoc.avatar,
    bio: userDoc.bio,
    role: userDoc.role,
    isVerifiedCreator: userDoc.isVerifiedCreator,
    createdAt: userDoc.createdAt,
  };
};

const buildProfileUser = (userDoc) => {
  // Payload for profile pages + post author population
  return {
    _id: userDoc._id,
    name: userDoc.name,
    username: userDoc.username,
    role: userDoc.role,
    avatar: userDoc.avatar,
    bio: userDoc.bio,
    isVerifiedCreator: userDoc.isVerifiedCreator,
  };
};

const getMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return jsonError(res, 401, 'Not authorized');
    }
    return jsonSuccess(res, 200, buildSafeSelfUser(req.user));
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return jsonError(res, 400, 'Invalid user id');
    }

    const user = await User.findById(id).select('name username avatar bio role isVerifiedCreator createdAt');

    if (!user) {
      return jsonError(res, 404, 'User not found');
    }

    return jsonSuccess(res, 200, buildPublicUser(user));
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// GET /api/v1/users/:id/profile
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return jsonError(res, 400, 'Invalid user id');
    }

    const user = await User.findById(id).select('name username avatar bio role isVerifiedCreator createdAt');
    if (!user) {
      return jsonError(res, 404, 'User not found');
    }

    const viewerId = req.user?._id;

    const [followers, following, posts, isFollowing] = await Promise.all([
      Follow.countDocuments({ followingId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
      Post.countDocuments({ author: user._id }),
      viewerId ? Follow.exists({ followerId: viewerId, followingId: user._id }) : null,
    ]);

    return jsonSuccess(res, 200, {
      user: buildProfileUser(user),
      counts: {
        followers: Number(followers || 0),
        following: Number(following || 0),
        posts: Number(posts || 0),
      },
      isFollowing: Boolean(isFollowing),
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const updateMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return jsonError(res, 401, 'Not authorized');
    }

    const updates = {};

    if (typeof req.body.name === 'string') {
      const name = req.body.name.trim();
      if (name) updates.name = name;
    }

    if (typeof req.body.email === 'string') {
      const normalizedEmail = req.body.email.trim().toLowerCase();
      if (!normalizedEmail) {
        return jsonError(res, 400, 'Email cannot be empty');
      }

      const existing = await User.findOne({ email: normalizedEmail }).select('_id');
      if (existing && String(existing._id) !== String(req.user._id)) {
        return jsonError(res, 409, 'Email already in use');
      }

      updates.email = normalizedEmail;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return jsonError(res, 404, 'User not found');
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'name')) user.name = updates.name;
    if (Object.prototype.hasOwnProperty.call(updates, 'email')) user.email = updates.email;

    await user.save();

    return jsonSuccess(res, 200, buildSafeSelfUser(user));
  } catch (error) {
    if (error && error.code === 11000) {
      return jsonError(res, 409, 'Email already in use');
    }
    return jsonError(res, 500, 'Server error');
  }
};

const deleteMyAccount = async (req, res) => {
  try {
    if (!req.user) {
      return jsonError(res, 401, 'Not authorized');
    }

    const deleted = await User.findByIdAndDelete(req.user._id).select('_id');

    if (!deleted) {
      return jsonError(res, 404, 'User not found');
    }

    return jsonSuccess(res, 200, { message: 'Account deleted' });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const listUsersLight = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name username avatar role isVerifiedCreator createdAt')
      .sort({ createdAt: -1 })
      .limit(500);

    return jsonSuccess(res, 200, { users });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

module.exports = {
  getMyProfile,
  getUserById,
  getUserProfile,
  updateMyProfile,
  deleteMyAccount,
  listUsersLight,
};
