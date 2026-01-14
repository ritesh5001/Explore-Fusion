import API from './index';

const unwrap = (res) => res?.data?.data ?? res?.data;

const asArray = (v) => (Array.isArray(v) ? v : []);

export const getPostsByUser = async (userId) => {
	if (!userId) throw new Error('User id is required');
	const res = await API.get(`/posts/user/${userId}`);
	const body = unwrap(res);
	const list = body?.posts ?? body?.data?.posts ?? body;
	return asArray(list);
};
