const { getImagekit } = require('../../auth/config/imagekit');

const getUploadedFile = (req) =>
  req.files?.file?.[0] || req.files?.image?.[0] || req.file || null;

const createLocalUploadHandler = () => (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({
    message: 'File uploaded successfully',
    imageUrl,
  });
};

const uploadBrandingAsset = async (req, res) => {
  try {
    const file = getUploadedFile(req);

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

module.exports = {
  createLocalUploadHandler,
  uploadBrandingAsset,
};
