import { useEffect, useMemo, useState } from 'react';
import API from '../api';
import { useToast } from '../components/ToastProvider';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageLoader from '../components/ui/PageLoader';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

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
		<div className="container-app page-section max-w-6xl">
			<SectionHeader
				title="My Bookings"
				subtitle="Manage your upcoming trips and reservations."
				right={
					<Button variant="outline" size="sm" onClick={load} aria-label="Refresh bookings">
						Refresh
					</Button>
				}
			/>

			{loading ? (
				<PageLoader label="Loading bookings…" />
			) : error ? (
				<ErrorState title="Couldn’t load bookings" description={error} onRetry={load} />
			) : !hasBookings ? (
				<EmptyState
					title="No bookings yet"
					description="When you book a trip, it will show up here."
					actionLabel="Browse packages"
					onAction={() => (window.location.href = '/packages')}
					icon="🧳"
				/>
			) : (
				<div className="space-y-3">
					{bookings.map((b) => {
						const id = getBookingId(b);
						const status = getStatus(b);
						const title = getPackageTitle(b);
						const price = getPackagePrice(b);
						return (
							<Card key={id} className="p-4 flex items-center justify-between gap-4">
								<div>
									<div className="font-semibold text-charcoal dark:text-sand">{title}</div>
									<div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1">
										Price: {price != null ? `$${price}` : '—'}
									</div>
									<div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1">
										Status:{' '}
										<span
											className={`font-semibold ${status === 'cancelled' ? 'text-charcoal/50 dark:text-sand/50' : 'text-green-700'}`}
										>
											{status}
										</span>
									</div>
								</div>

								{status !== 'cancelled' && (
									<Button
										variant="danger"
										size="sm"
										onClick={() => cancelBooking(id)}
										disabled={cancellingId === id}
										aria-label="Cancel booking"
									>
										{cancellingId === id ? 'Cancelling…' : 'Cancel'}
									</Button>
								)}
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
