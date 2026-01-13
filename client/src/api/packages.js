import API from './index';

const normalizePackagesResponse = (body) => {
	const list = body?.data?.packages ?? body?.packages ?? body;
	return Array.isArray(list) ? list : [];
};

export const getPackages = async () => {
	const res = await API.get('/packages');
	return normalizePackagesResponse(res?.data);
};

export const getPackageById = async (id) => {
	if (!id) throw new Error('Package id is required');
	const res = await API.get(`/packages/${id}`);
	return res?.data?.data ?? res?.data;
};

export const createPackage = async (data) => {
	const res = await API.post('/packages', data);
	return res?.data?.data ?? res?.data;
};
