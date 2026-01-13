import { useEffect, useMemo, useState } from 'react';
import API from '../api';
import { useToast } from '../components/ToastProvider';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeBookings = (body) => {
	const data = body?.data ?? body;
	const list = data?.bookings ?? data?.items ?? data;
	return asArray(list);
};

const getBookingId = (b) => b?._id || b?.id;

const getStatus = (b) => String(b?.status || b?.bookingStatus || '').toLowerCase() || 'confirmed';

const getPackage = (b) => b?.package || b?.packageId || b?.pkg || null;

const getPackageTitle = (b) => {
	const p = getPackage(b);
	return p?.title || b?.packageTitle || b?.title || 'Package';
};

const getPackagePrice = (b) => {
	const p = getPackage(b);
	return p?.price ?? b?.price;
};

export default function MyBookings() {
	const { showToast } = useToast();
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [cancellingId, setCancellingId] = useState(null);

	const load = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await API.get('/bookings/my');
			setBookings(normalizeBookings(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const serverMessage = e?.response?.data?.message || e?.response?.data?.error;
			setError((serverMessage || e?.message || 'Failed to load bookings') + (status ? ` (HTTP ${status})` : ''));
			setBookings([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const hasBookings = useMemo(() => bookings.length > 0, [bookings]);

	const cancelBooking = async (bookingId) => {
		if (!bookingId) return;
		setCancellingId(bookingId);
		try {
			await API.put(`/bookings/${bookingId}/cancel`);
			showToast('Booking cancelled', 'success');
			setBookings((prev) =>
				asArray(prev).map((b) => (getBookingId(b) === bookingId ? { ...b, status: 'cancelled' } : b))
			);
		} catch (e) {
			const status = e?.response?.status;
			const serverMessage = e?.response?.data?.message || e?.response?.data?.error;
			showToast(serverMessage || 'Cancel failed', 'error');
			setError((serverMessage || e?.message || 'Cancel failed') + (status ? ` (HTTP ${status})` : ''));
		} finally {
			setCancellingId(null);
		}
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-2xl font-bold">My Bookings</h1>
				<button onClick={load} className="text-sm font-semibold text-blue-600 hover:underline">
					Refresh
				</button>
			</div>

			{loading ? (
				<div className="bg-white border rounded-lg p-6 text-gray-600">Loading bookings…</div>
			) : error ? (
				<div className="bg-white border rounded-lg p-6">
					<div className="text-red-600 font-semibold">Error</div>
					<div className="text-gray-700 text-sm mt-1">{error}</div>
				</div>
			) : !hasBookings ? (
				<div className="bg-white border rounded-lg p-6 text-gray-600">No bookings yet.</div>
			) : (
				<div className="space-y-3">
					{bookings.map((b) => {
						const id = getBookingId(b);
						const status = getStatus(b);
						const title = getPackageTitle(b);
						const price = getPackagePrice(b);
						return (
							<div key={id} className="bg-white border rounded-lg p-4 flex items-center justify-between gap-4">
								<div>
									<div className="font-semibold text-gray-900">{title}</div>
									<div className="text-sm text-gray-600 mt-1">
										Price: {price != null ? `$${price}` : '—'}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										Status:{' '}
										<span
											className={`font-semibold ${status === 'cancelled' ? 'text-gray-500' : 'text-green-700'}`}
										>
											{status}
										</span>
									</div>
								</div>

								{status !== 'cancelled' && (
									<button
										onClick={() => cancelBooking(id)}
										disabled={cancellingId === id}
										className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
									>
										{cancellingId === id ? 'Cancelling…' : 'Cancel'}
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
