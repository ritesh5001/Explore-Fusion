import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

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
		<div className="container-app page-section max-w-5xl">
			<SectionHeader title="Chat" subtitle="Choose a room to start chatting." />

			{loading ? (
				<PageLoader label="Loading rooms…" />
			) : error ? (
				<ErrorState title="Couldn’t load chat rooms" description={error} />
			) : safeRooms.length === 0 ? (
				<EmptyState title="No rooms available" description="Try again later." icon="💬" />
			) : (
				<div className="mt-6 grid sm:grid-cols-2 gap-4">
					{safeRooms.map((r) => (
						<Link key={r.roomId} to={`/chat/${encodeURIComponent(r.roomId)}`} aria-label={`Open chat room ${r.name}`}>
							<Card className="p-5 hover:border-trail/40">
								<div className="font-semibold text-charcoal dark:text-sand">{r.name}</div>
								<div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1">Room ID: {r.roomId}</div>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
