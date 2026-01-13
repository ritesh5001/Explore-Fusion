const imagekit = require('../config/imagekit');

const jsonError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

// POST /api/v1/imagekit-auth
// Protected: must be authenticated; blocked users are denied by protect middleware.
exports.getImagekitAuth = async (req, res) => {
  try {
    const params = imagekit.getAuthenticationParameters();

    // Must return exactly token/expire/signature per ImageKit client SDK expectations
    return res.status(200).json({
      token: params.token,
      expire: params.expire,
      signature: params.signature,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ImageKit auth error:', error?.message || error);
    return jsonError(res, 500, 'Failed to generate upload auth');
  }
};
