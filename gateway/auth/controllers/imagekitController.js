const imagekit = require('../config/imagekit');

const jsonError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

exports.getImagekitAuth = async (req, res) => {
  try {
    const params = imagekit.getAuthenticationParameters();

    return res.status(200).json({
      token: params.token,
      expire: params.expire,
      signature: params.signature,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error?.message || error);
    return jsonError(res, 500, 'Failed to generate upload auth');
  }
};
