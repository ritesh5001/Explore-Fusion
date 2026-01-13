const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jsonError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return jsonError(res, 401, 'Not authorized, user not found');
      }

      if (req.user.isBlocked) {
        return jsonError(res, 403, 'Account is blocked');
      }

      next();
    } catch (error) {
      console.error(error);
      return jsonError(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return jsonError(res, 401, 'Not authorized, no token');
  }
};

const isAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'admin' || role === 'superadmin') return next();
  return jsonError(res, 403, 'Forbidden');
};

const isSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'superadmin') return next();
  return jsonError(res, 403, 'Forbidden');
};

module.exports = { protect, isAdmin, isSuperAdmin };