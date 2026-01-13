const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = function securityMiddleware() {
	const maxBodyBytes = 5 * 1024 * 1024;

	const contentLengthLimit = (req, res, next) => {
		const method = String(req.method || '').toUpperCase();
		if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next();

		const contentLengthHeader = req.headers['content-length'];
		const contentLength = contentLengthHeader ? Number(contentLengthHeader) : NaN;
		if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
			return res.status(413).json({
				success: false,
				message: 'Payload too large',
			});
		}

		return next();
	};

	const jsonParser = express.json({ limit: '5mb' });
	const urlencodedParser = express.urlencoded({ extended: true, limit: '5mb' });
	const conditionalBodyParsers = (req, res, next) => {
		const path = String(req.path || '');
		const isProxyRoute =
			path.startsWith('/api/') ||
			path.startsWith('/auth') ||
			path.startsWith('/uploads') ||
			path.startsWith('/socket.io');

		if (isProxyRoute) return next();

		jsonParser(req, res, (jsonErr) => {
			if (jsonErr) return next(jsonErr);
			urlencodedParser(req, res, next);
		});
	};

	return [
		helmet(),
		contentLengthLimit,
		conditionalBodyParsers,
		rateLimit({
			windowMs: 15 * 60 * 1000,
			limit: 100,
			standardHeaders: true,
			legacyHeaders: false,
		}),
	];
};
