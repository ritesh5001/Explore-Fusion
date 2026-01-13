const jwt = require('jsonwebtoken');

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
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return jsonError(res, 401, 'Not authorized, no token');
  }

  try {
    if (!process.env.JWT_SECRET) {
      return jsonError(res, 500, 'Server misconfigured');
    }

    jwt.verify(token, process.env.JWT_SECRET);

    const authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

    const meUrl = `${authServiceUrl}/api/v1/auth/me`;

    let resp;
    try {
      resp = await fetch(meUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      return jsonError(res, 503, 'Auth service unavailable');
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

    return next();
  } catch (error) {
    return jsonError(res, 401, 'Not authorized, token failed');
  }
};

module.exports = { protect };
