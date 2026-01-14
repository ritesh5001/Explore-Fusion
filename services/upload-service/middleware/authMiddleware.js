const jsonError = (res, status, message) => {
	return res.status(status).json({
		success: false,
		message,
	});
};

const isProd = process.env.NODE_ENV === 'production';

const getGatewayUrl = () => {
	if (process.env.GATEWAY_URL) return process.env.GATEWAY_URL;
	if (!isProd) return 'http://localhost:5050';
	return null;
};

const getFetch = () => {
	if (typeof globalThis.fetch === 'function') return globalThis.fetch;
	return async (...args) => {
		const mod = await import('node-fetch');
		return mod.default(...args);
	};
};

const protect = async (req, res, next) => {
	const header = String(req.headers.authorization || '');
	if (!header.startsWith('Bearer ')) {
		return jsonError(res, 401, 'Not authorized, no token');
	}

	const token = header.split(' ')[1];
	const gatewayUrl = getGatewayUrl();
	if (!gatewayUrl) {
		return jsonError(res, 503, 'Gateway not configured');
	}

	try {
		const fetch = getFetch();
		const resp = await fetch(`${String(gatewayUrl).replace(/\/$/, '')}/api/v1/auth/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const payload = await resp.json().catch(() => null);
		if (!resp.ok) {
			return jsonError(res, resp.status, payload?.message || 'Not authorized');
		}

		req.user = payload?.data;
		if (!req.user?._id) {
			return jsonError(res, 401, 'Not authorized');
		}

		return next();
	} catch {
		return jsonError(res, 503, 'Gateway unavailable');
	}
};

const requireAdmin = (req, res, next) => {
	const role = req.user?.role;
	if (role === 'admin' || role === 'superadmin') return next();
	return jsonError(res, 403, 'Forbidden');
};

module.exports = { protect, requireAdmin };
