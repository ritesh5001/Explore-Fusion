export const getApiBaseUrl = () => {
	return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';
};

export const getGatewayOrigin = () => {
	const base = getApiBaseUrl();
	try {
		const url = new URL(base);
		url.pathname = url.pathname.replace(/\/?api\/?v1\/?$/, '');
		url.search = '';
		url.hash = '';
		return url.toString().replace(/\/$/, '');
	} catch {
		return 'http://localhost:5050';
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
	return import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT || `${getApiBaseUrl()}/imagekit-auth`;
};

export const getSocketUrl = () => {
	return import.meta.env.VITE_SOCKET_URL || getGatewayOrigin();
};
