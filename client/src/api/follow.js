import API from './index';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const followUser = async (id) => {
	if (!id) throw new Error('User id is required');
	const res = await API.post(`/follow/${id}`);
	return unwrap(res);
};

export const unfollowUser = async (id) => {
	if (!id) throw new Error('User id is required');
	const res = await API.delete(`/follow/${id}`);
	return unwrap(res);
};

export const getFollowers = async (id) => {
	if (!id) throw new Error('User id is required');
	const res = await API.get(`/follow/followers/${id}`);
	return unwrap(res);
};

export const getFollowing = async (id) => {
	if (!id) throw new Error('User id is required');
	const res = await API.get(`/follow/following/${id}`);
	return unwrap(res);
};
