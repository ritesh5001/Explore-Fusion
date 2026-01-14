import API from './index';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const getUserProfile = async (id) => {
	if (!id) throw new Error('User id is required');
	const res = await API.get(`/users/${id}/profile`);
	return unwrap(res);
};
