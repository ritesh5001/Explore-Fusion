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

exports.uploadBrandingAsset = async (req, res) => {
  try {
    const file =
      req.files?.file?.[0] ||
      req.files?.image?.[0] ||
      req.file ||
      null;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const folder = String(req.body?.folder || 'explore-fusion/branding').trim();
    const rawName = String(req.body?.fileName || file.originalname || 'logo.png').trim();
    const fileName = rawName.replace(/\s+/g, '-');

    const dataUri = `data:${file.mimetype || 'application/octet-stream'};base64,${file.buffer.toString('base64')}`;

    const imagekit = getImagekit();
    const uploaded = await imagekit.upload({
      file: dataUri,
      fileName,
      folder,
      useUniqueFileName: false,
      overwriteFile: true,
      overwriteTags: true,
      overwriteCustomMetadata: true,
      tags: ['branding'],
      customMetadata: {
        kind: 'branding',
        uploadedById: req.user?._id ? String(req.user._id) : undefined,
        uploadedByName: req.user?.name ? String(req.user.name).slice(0, 80) : undefined,
        uploadedAt: new Date().toISOString(),
      },
    });

    return res.json({
      success: true,
      data: {
        url: uploaded.url,
        fileId: uploaded.fileId,
        name: uploaded.name,
        folder,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Branding upload failed',
    });
  }
};