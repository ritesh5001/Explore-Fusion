const User = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';
let warnedMissingGatewayUrl = false;

const getGatewayUrl = () => {
  if (process.env.GATEWAY_URL) return process.env.GATEWAY_URL;
  if (!isProd) return 'http://localhost:5050';
  return null;
};

const sendAdminNotification = async ({ token, userId, action }) => {
	const gatewayUrl = getGatewayUrl();
	if (!gatewayUrl) {
		if (!warnedMissingGatewayUrl) {
			warnedMissingGatewayUrl = true;
			console.warn('GATEWAY_URL is not set; skipping admin notifications');
		}
		return;
	}

  try {
    await fetch(`${String(gatewayUrl).replace(/\/$/, '')}/api/v1/notifications`, {
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

  const actorRole = req.user?.role;
  if (actorRole !== 'admin' && actorRole !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (actorRole === 'admin') {
    const target = await User.findById(req.params.id).select('role');
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedTargets = new Set(['user', 'creator']);
    const allowedNewRoles = new Set(['user', 'creator']);

    if (!allowedTargets.has(target.role)) {
      return res.status(403).json({ message: 'Admins can only change roles for users and creators' });
    }

    if (!allowedNewRoles.has(role)) {
      return res.status(403).json({ message: 'Admins can only set roles to user or creator' });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

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