const mongoose = require('mongoose');
const Follow = require('../models/Follow');
const { jsonError, GATEWAY_URL } = require('../middleware/authMiddleware');

const ROLES = ['user', 'creator', 'admin', 'superadmin'];
const ALLOWED_FOLLOWER_ROLES = new Set(['user', 'creator', 'admin']);
const ALLOWED_FOLLOWING_ROLES = new Set(['user', 'creator']);
const BLOCKED_TARGET_ROLES = new Set(['admin', 'superadmin']);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const fetchUserRoleById = async ({ token, userId }) => {
  if (!GATEWAY_URL) {
    throw new Error('Gateway not configured');
  }

  const url = `${GATEWAY_URL.replace(/\/$/, '')}/api/v1/users/${String(userId)}`;

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await resp.json().catch(() => null);
  if (!resp.ok) {
    const message = body?.message || 'Failed to load user';
    const err = new Error(message);
    err.statusCode = resp.status;
    throw err;
  }

  const role = body?.data?.role || body?.role;
  if (!role || !ROLES.includes(role)) {
    const err = new Error('User role unavailable');
    err.statusCode = 400;
    throw err;
  }

  return role;
};

const getCountsForUser = async (userId) => {
  const [followersCount, followingCount] = await Promise.all([
    Follow.countDocuments({ followingId: userId }),
    Follow.countDocuments({ followerId: userId }),
  ]);

  return { followersCount, followingCount };
};

const ensureFollowAllowed = ({ followerRole, followingRole }) => {
  if (followerRole === 'superadmin') {
    return { allowed: false, message: 'You cannot follow this account' };
  }

  if (BLOCKED_TARGET_ROLES.has(followingRole)) {
    return { allowed: false, message: 'You cannot follow this account' };
  }

  if (!ALLOWED_FOLLOWER_ROLES.has(followerRole)) {
    return { allowed: false, message: 'You cannot follow this account' };
  }

  if (!ALLOWED_FOLLOWING_ROLES.has(followingRole)) {
    return { allowed: false, message: 'You cannot follow this account' };
  }

  return { allowed: true };
};

// POST /api/v1/follow/:id
exports.followUser = async (req, res) => {
  const followerId = req.user?._id;
  const followerRole = req.user?.role;
  const followingId = req.params?.id;

  if (!followerId || !followerRole) {
    return jsonError(res, 401, 'Not authorized');
  }

  if (!followingId || !isValidObjectId(followingId)) {
    return jsonError(res, 400, 'Invalid user id');
  }

  if (String(followerId) === String(followingId)) {
    return jsonError(res, 400, 'You cannot follow yourself');
  }

  try {
    const followingRole = await fetchUserRoleById({ token: req.token, userId: followingId });

    const rule = ensureFollowAllowed({ followerRole, followingRole });
    if (!rule.allowed) {
      return res.status(403).json({ message: rule.message });
    }

    const existing = await Follow.findOne({ followerId, followingId }).lean();
    if (existing) {
      const counts = await getCountsForUser(followingId);
      return res.json({
        success: true,
        message: 'Already following',
        data: {
          followerId,
          followingId,
          followerRole,
          followingRole,
          followersCount: counts.followersCount,
        },
      });
    }

    await Follow.create({
      followerId,
      followerRole,
      followingId,
      followingRole,
    });

    const counts = await getCountsForUser(followingId);

    return res.status(201).json({
      success: true,
      message: 'Followed',
      data: {
        followerId,
        followingId,
        followerRole,
        followingRole,
        followersCount: counts.followersCount,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      const counts = await getCountsForUser(followingId);
      return res.json({
        success: true,
        message: 'Already following',
        data: {
          followerId,
          followingId,
          followerRole,
          followersCount: counts.followersCount,
        },
      });
    }

    const status = error?.statusCode || 500;
    const message = error?.message || 'Failed to follow user';
    return jsonError(res, status, message);
  }
};

// DELETE /api/v1/unfollow/:id
exports.unfollowUser = async (req, res) => {
  const followerId = req.user?._id;
  const followingId = req.params?.id;

  if (!followerId) return jsonError(res, 401, 'Not authorized');
  if (!followingId || !isValidObjectId(followingId)) {
    return jsonError(res, 400, 'Invalid user id');
  }

  try {
    const result = await Follow.deleteOne({ followerId, followingId });
    const counts = await getCountsForUser(followingId);

    return res.json({
      success: true,
      message: result?.deletedCount ? 'Unfollowed' : 'Not following',
      data: {
        followerId,
        followingId,
        removed: Boolean(result?.deletedCount),
        followersCount: counts.followersCount,
      },
    });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Failed to unfollow user');
  }
};

// GET /api/v1/followers/:id
exports.getFollowers = async (req, res) => {
  const userId = req.params?.id;
  if (!userId || !isValidObjectId(userId)) {
    return jsonError(res, 400, 'Invalid user id');
  }

  try {
    const [items, followersCount, followingCount] = await Promise.all([
      Follow.find({ followingId: userId })
        .select('followerId followerRole createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Follow.countDocuments({ followingId: userId }),
      Follow.countDocuments({ followerId: userId }),
    ]);

    return res.json({
      success: true,
      data: {
        userId,
        followers: items,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Failed to get followers');
  }
};

// GET /api/v1/following/:id
exports.getFollowing = async (req, res) => {
  const userId = req.params?.id;
  if (!userId || !isValidObjectId(userId)) {
    return jsonError(res, 400, 'Invalid user id');
  }

  try {
    const [items, followersCount, followingCount] = await Promise.all([
      Follow.find({ followerId: userId })
        .select('followingId followingRole createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Follow.countDocuments({ followingId: userId }),
      Follow.countDocuments({ followerId: userId }),
    ]);

    return res.json({
      success: true,
      data: {
        userId,
        following: items,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Failed to get following');
  }
};
