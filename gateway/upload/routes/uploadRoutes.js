const express = require('express');
const multer = require('multer');
const { protect, isAdmin } = require('../../auth/middleware/authMiddleware');
const { createLocalUploadHandler, uploadBrandingAsset } = require('../controllers/uploadController');

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = (uploadsDir) => {
  const router = express.Router();

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });
  const diskUpload = multer({ storage: diskStorage });

  router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'upload', env: process.env.NODE_ENV });
  });

  router.post('/', diskUpload.single('image'), createLocalUploadHandler());

  router.post(
    '/branding',
    protect,
    isAdmin,
    memoryUpload.fields([
      { name: 'file', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ]),
    uploadBrandingAsset
  );

  return router;
};
