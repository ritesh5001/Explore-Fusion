const express = require("express");
const router = express.Router();
const multer = require('multer');
const { getUploadAuth, uploadBrandingAsset } = require("../controllers/uploadController");
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});

router.get("/auth", getUploadAuth);

// Upload branding assets (logo, favicon, etc.) to ImageKit.
// Requires Authorization: Bearer <token> and admin/superadmin role.
router.post(
	'/branding',
	protect,
	requireAdmin,
	upload.fields([
		{ name: 'file', maxCount: 1 },
		{ name: 'image', maxCount: 1 },
	]),
	uploadBrandingAsset
);

module.exports = router;