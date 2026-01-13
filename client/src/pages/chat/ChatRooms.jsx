import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeRooms = (body) => {
	const data = body?.data ?? body;
	const list = data?.rooms ?? data?.items ?? data;
	return asArray(list);
};

const toRoomVm = (r) => {
	const roomId = r?.roomId || r?._id || r?.id;
	const name = r?.name || r?.title || r?.roomName || 'Room';
	return roomId ? { roomId: String(roomId), name: String(name) } : null;
};

const fallbackRooms = [
	{ roomId: 'global-travelers', name: 'Global Travelers' },
	{ roomId: 'trip-buddies', name: 'Trip Buddies' },
];

export default function ChatRooms() {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [rooms, setRooms] = useState([]);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError('');
			try {
				const res = await API.get('/chats/my');
				const normalized = normalizeRooms(res?.data).map(toRoomVm).filter(Boolean);
				if (!normalized.length) {
					setRooms(fallbackRooms);
				} else {
					setRooms(normalized);
				}
			} catch (e) {
				// If REST isn't implemented, fall back to static rooms per spec.
				const status = e?.response?.status;
				if (status && status !== 404 && status !== 501) {
					const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load rooms';
					setError(msg + ` (HTTP ${status})`);
					showToast('Failed to load chat rooms', 'error');
				}
				setRooms(fallbackRooms);
			} finally {
				setLoading(false);
			}
		};

		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const safeRooms = useMemo(() => (rooms.length ? rooms : fallbackRooms), [rooms]);

	return (
		<div className="max-w-5xl mx-auto px-4 py-10">
			<h1 className="text-2xl font-bold mb-2">Chat</h1>
			<p className="text-gray-600 mb-6">Choose a room to start chatting.</p>

			{loading ? (
				<div className="bg-white border rounded-lg p-6 text-gray-600">Loading rooms…</div>
			) : error ? (
				<div className="bg-white border rounded-lg p-6">
					<div className="text-red-600 font-semibold">Error</div>
					<div className="text-gray-700 text-sm mt-1">{error}</div>
				</div>
			) : (
				<div className="grid sm:grid-cols-2 gap-4">
					{safeRooms.map((r) => (
						<Link
							key={r.roomId}
							to={`/chat/${encodeURIComponent(r.roomId)}`}
							className="bg-white border rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition"
						>
							<div className="font-semibold text-gray-900">{r.name}</div>
							<div className="text-sm text-gray-600 mt-1">Room ID: {r.roomId}</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
