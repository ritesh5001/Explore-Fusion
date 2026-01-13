import { useEffect, useState } from 'react';
import API from '../../api';
import BuddyCard from '../../components/buddy/BuddyCard';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeMyBuddies = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.buddies ?? data?.matches ?? data?.items ?? data);
};

const getBuddyUser = (m) => m?.buddy || m?.user || m?.otherUser || m?.partner || m;

export default function MyBuddies() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);

	const load = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await API.get('/matches/my');
			setItems(normalizeMyBuddies(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load buddies';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="max-w-5xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-2xl font-bold">My Buddies</h1>
				<button onClick={load} className="text-sm font-semibold text-blue-600 hover:underline">
					Refresh
				</button>
			</div>

			{loading ? (
				<div className="bg-white border rounded-lg p-6 text-gray-600">Loading…</div>
			) : error ? (
				<div className="bg-white border rounded-lg p-6">
					<div className="text-red-600 font-semibold">Error</div>
					<div className="text-gray-700 text-sm mt-1">{error}</div>
				</div>
			) : items.length === 0 ? (
				<div className="bg-white border rounded-lg p-6 text-gray-600">No buddies yet.</div>
			) : (
				<div className="space-y-3">
					{items.map((m, idx) => {
						const u = getBuddyUser(m);
						const id = u?._id || u?.id || idx;
						return <BuddyCard key={id} user={u} />;
					})}
				</div>
			)}
		</div>
	);
}
