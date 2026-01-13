import { useEffect, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import BuddyCard from '../../components/buddy/BuddyCard';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeSuggestions = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.suggestions ?? data?.users ?? data);
};

export default function BuddySuggestions() {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);
	const [sendingTo, setSendingTo] = useState(null);

	const load = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await API.get('/matches/suggestions');
			setItems(normalizeSuggestions(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load suggestions';
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

	const sendRequest = async (userId) => {
		if (!userId) return;
		setSendingTo(userId);
		try {
			await API.post(`/matches/${userId}/request`);
			showToast('Request sent', 'success');
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Request failed';
			showToast(msg, 'error');
		} finally {
			setSendingTo(null);
		}
	};

	return (
		<div className="max-w-5xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-2xl font-bold">Buddy Suggestions</h1>
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
				<div className="bg-white border rounded-lg p-6 text-gray-600">No suggestions right now.</div>
			) : (
				<div className="space-y-3">
					{items.map((u) => {
						const id = u?._id || u?.id;
						return (
							<BuddyCard
								key={id}
								user={u}
								actions={
									<button
										onClick={() => sendRequest(id)}
										disabled={sendingTo === id}
										className="bg-blue-600 text-white font-semibold px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
									>
										{sendingTo === id ? 'Sending…' : 'Request'}
									</button>
								}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
