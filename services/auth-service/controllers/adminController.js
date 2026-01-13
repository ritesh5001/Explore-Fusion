const User = require('../models/User');

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

  res.json({
    message: user.isBlocked ? 'User blocked' : 'User unblocked',
    user
  });
};