const normalizeApiBaseUrl = (raw) => {
	if (!raw) return raw;
	const base = String(raw).replace(/\/$/, '');
	if (base === '/api/v1' || base.endsWith('/api/v1')) return base;
	return `${base}/api/v1`;
};

export const getApiBaseUrl = () => {
	return (
		normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
		(import.meta.env.DEV ? 'http://localhost:5050/api/v1' : '/api/v1')
	);
};

export const getGatewayOrigin = () => {
	const base = getApiBaseUrl();
	// If base is relative (e.g. '/api/v1'), assume same-origin.
	if (typeof base === 'string' && base.startsWith('/')) {
		try {
			return window.location.origin;
		} catch {
			return '';
		}
	}
	try {
		const url = new URL(base);
		url.pathname = url.pathname.replace(/\/?api\/?v1\/?$/, '');
		url.search = '';
		url.hash = '';
		return url.toString().replace(/\/$/, '');
	} catch {
		// Last resort: in dev fall back to localhost, in prod to same-origin.
		try {
			return import.meta.env.DEV ? 'http://localhost:5050' : window.location.origin;
		} catch {
			return import.meta.env.DEV ? 'http://localhost:5050' : '';
		}
	}
};

export const resolveGatewayUrl = (pathOrUrl) => {
	if (!pathOrUrl) return pathOrUrl;
	const raw = String(pathOrUrl);
	if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
	const origin = getGatewayOrigin();
	return `${origin}${raw.startsWith('/') ? raw : `/${raw}`}`;
};

export const getImagekitAuthEndpoint = () => {
	// Always resolve via the gateway base URL (no localhost / hardcoded overrides).
	return `${getApiBaseUrl()}/imagekit-auth`;
};

export const getSocketUrl = () => {
	return import.meta.env.VITE_SOCKET_URL || getGatewayOrigin();
};
