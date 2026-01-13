const User = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';
const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL || (!isProd ? 'http://localhost:5003' : null);
if (!BOOKING_SERVICE_URL) {
  throw new Error('BOOKING_SERVICE_URL is required in production');
}

const sendAdminNotification = async ({ token, userId, action }) => {
  try {
    await fetch(`${BOOKING_SERVICE_URL}/api/v1/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        type: 'admin_action',
        title: 'Account update',
        message: action,
        link: '/profile',
      }),
    });
  } catch (_) {
    // best-effort
  }
};

// GET /api/v1/admin/users
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// PATCH /api/v1/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;

  const allowed = ['user','creator','admin','superadmin'];
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  res.json(user);
};

// PATCH /api/v1/admin/users/:id/block
exports.toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isBlocked = !user.isBlocked;
  await user.save();

  const token = req.headers?.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;
  if (token) {
    await sendAdminNotification({
      token,
      userId: user._id,
      action: user.isBlocked ? 'Your account has been blocked by an admin.' : 'Your account has been unblocked by an admin.',
    });
  }

  res.json({
    message: user.isBlocked ? 'User blocked' : 'User unblocked',
    user
  });
};