const jwt = require('jsonwebtoken');

const jsonError = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

const makeAuthMiddleware = ({ User }) => {
  const protect = async (req, res, next) => {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return jsonError(res, 401, 'Not authorized, no token');
    }

    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) return jsonError(res, 401, 'Not authorized, user not found');
      if (user.isBlocked) return jsonError(res, 403, 'Account is blocked');

      req.user = user;
      return next();
    } catch (err) {
      return jsonError(res, 401, 'Not authorized, token failed');
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

  return { protect, isAdmin, isSuperAdmin };
};

module.exports = { makeAuthMiddleware };
