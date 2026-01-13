const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = function securityMiddleware() {
	return [
		helmet(),
		express.json({ limit: '5mb' }),
		express.urlencoded({ extended: true, limit: '5mb' }),
		rateLimit({
			windowMs: 15 * 60 * 1000,
			limit: 100,
			standardHeaders: true,
			legacyHeaders: false,
		}),
	];
};
