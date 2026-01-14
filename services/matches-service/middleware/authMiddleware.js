const jwt = require('jsonwebtoken');

const isProd = process.env.NODE_ENV === 'production';
const GATEWAY_URL = process.env.GATEWAY_URL || (!isProd ? 'http://localhost:5050' : null);

const jsonError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return jsonError(res, 401, 'Not authorized, no token');
  }

  try {
    if (!GATEWAY_URL) {
      return jsonError(res, 503, 'Gateway not configured');
    }

    if (!process.env.JWT_SECRET) {
      return jsonError(res, 500, 'Server misconfigured');
    }

    jwt.verify(token, process.env.JWT_SECRET);

    const meUrl = `${GATEWAY_URL.replace(/\/$/, '')}/api/v1/auth/me`;

    let resp;
    try {
      resp = await fetch(meUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (_) {
      return jsonError(res, 503, 'Gateway unavailable');
    }

    const payload = await resp.json().catch(() => null);

    if (!resp.ok) {
      const message = payload?.message || 'Not authorized';
      return jsonError(res, resp.status, message);
    }

    req.user = payload?.data;
    if (!req.user?._id) {
      return jsonError(res, 401, 'Not authorized');
    }

    if (req.user?.isBlocked) {
      return jsonError(res, 403, 'Account is blocked');
    }

    return next();
  } catch (_) {
    return jsonError(res, 401, 'Not authorized, token failed');
  }
};

module.exports = { protect };
