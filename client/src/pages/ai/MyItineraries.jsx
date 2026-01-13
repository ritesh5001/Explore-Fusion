import { useEffect, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeList = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.itineraries ?? data?.items ?? data);
};

const getId = (it) => it?._id || it?.id;

export default function MyItineraries() {
	useAuth();
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);
	const [deletingId, setDeletingId] = useState(null);

	const load = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await API.get('/itineraries/my');
			setItems(normalizeList(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load itineraries';
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

	const remove = async (id) => {
		if (!id) return;
		setDeletingId(id);
		try {
			await API.delete(`/itineraries/${id}`);
			setItems((prev) => asArray(prev).filter((x) => getId(x) !== id));
			showToast('Itinerary deleted', 'success');
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Delete failed';
			showToast(msg, 'error');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-2xl font-bold">My Itineraries</h1>
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
				<div className="bg-white border rounded-lg p-6 text-gray-600">No itineraries yet.</div>
			) : (
				<div className="grid md:grid-cols-2 gap-4">
					{items.map((it) => {
						const id = getId(it);
						const title = it?.destination || it?.title || 'Itinerary';
						const days = it?.days;
						const style = it?.style;
						const budget = it?.budget;
						return (
							<div key={id} className="bg-white border rounded-lg p-5">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<div className="font-semibold text-gray-900 truncate">{title}</div>
										<div className="text-sm text-gray-600 mt-1">
											{days ? `${days} days` : '—'}
											{style ? ` • ${style}` : ''}
											{budget != null ? ` • Budget ${budget}` : ''}
									</div>
								</div>
								<button
									onClick={() => remove(id)}
									disabled={deletingId === id}
									className="bg-red-600 text-white font-semibold px-3 py-2 rounded hover:bg-red-700 disabled:opacity-60"
								>
									{deletingId === id ? 'Deleting…' : 'Delete'}
								</button>
							</div>

							{!!Array.isArray(it?.itinerary) && it.itinerary.length > 0 && (
								<div className="mt-4 space-y-2">
									{it.itinerary.slice(0, 3).map((d, idx) => (
										<div key={idx} className="text-sm text-gray-700">
											Day {d?.day ?? idx + 1}: {d?.plan ?? String(d)}
										</div>
									))}
									{it.itinerary.length > 3 && <div className="text-xs text-gray-500">+ more days…</div>}
								</div>
							)}
						</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
