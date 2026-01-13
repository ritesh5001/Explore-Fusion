import { useEffect, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeRequests = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.requests ?? data?.items ?? data);
};

const getReqId = (r) => r?._id || r?.id;

const getFromUser = (r) => r?.from || r?.fromUser || r?.requester || r?.user || r?.sender;

export default function BuddyRequests() {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);
	const [actingOn, setActingOn] = useState(null);

	const load = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await API.get('/matches/requests');
			setItems(normalizeRequests(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load requests';
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

	const act = async (matchId, action) => {
		if (!matchId) return;
		setActingOn(matchId);
		try {
			await API.post(`/matches/${matchId}/${action}`);
			showToast(action === 'accept' ? 'Request accepted' : 'Request rejected', 'success');
			setItems((prev) => asArray(prev).filter((r) => getReqId(r) !== matchId));
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Action failed';
			showToast(msg, 'error');
		} finally {
			setActingOn(null);
		}
	};

	return (
		<div className="max-w-5xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-2xl font-bold">Buddy Requests</h1>
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
				<div className="bg-white border rounded-lg p-6 text-gray-600">No pending requests.</div>
			) : (
				<div className="space-y-3">
					{items.map((r) => {
						const id = getReqId(r);
						const from = getFromUser(r);
						const name = from?.name || from?.fullName || from?.email || 'Traveler';
						return (
							<div key={id} className="bg-white border rounded-lg p-4 flex items-center justify-between gap-4">
								<div>
									<div className="font-semibold text-gray-900">{name}</div>
									<div className="text-sm text-gray-600 mt-1">Incoming buddy request</div>
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => act(id, 'accept')}
										disabled={actingOn === id}
										className="bg-green-600 text-white font-semibold px-3 py-2 rounded hover:bg-green-700 disabled:opacity-60"
									>
										Accept
									</button>
									<button
										onClick={() => act(id, 'reject')}
										disabled={actingOn === id}
										className="bg-gray-800 text-white font-semibold px-3 py-2 rounded hover:bg-black disabled:opacity-60"
									>
										Reject
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
