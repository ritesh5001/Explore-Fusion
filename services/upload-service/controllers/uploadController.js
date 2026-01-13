const { getImagekit } = require('../config/imagekit');

exports.getUploadAuth = (req, res) => {
  try {
    const imagekit = getImagekit();
    const result = imagekit.getAuthenticationParameters();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: error?.message || 'Failed to generate upload auth',
    });
  }
};