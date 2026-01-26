const Follow = require('../models/Follow');
const User = require('../../auth/models/User');

const ROLES = ['user', 'creator', 'admin', 'superadmin'];
const ALLOWED_FOLLOWER_ROLES = new Set(['user', 'creator', 'admin']);
const ALLOWED_FOLLOWING_ROLES = new Set(['user', 'creator']);
const BLOCKED_TARGET_ROLES = new Set(['admin', 'superadmin']);

const jsonError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const isValidObjectId = (value) => {
  try {
    return Boolean(value && typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value));
  } catch (error) {
    return false;
  }
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

const fetchUserRoleById = async (userId) => {
  const user = await User.findById(userId).select('role').lean();
  const role = user?.role;
  if (!role || !ROLES.includes(role)) {
    const error = new Error('User role unavailable');
    error.statusCode = 400;
    throw error;
  }
  return role;
};

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
    const followingRole = await fetchUserRoleById(followingId);
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
