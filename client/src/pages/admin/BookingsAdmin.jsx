import { useEffect, useMemo, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import AdminTable from '../../components/admin/AdminTable';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeBookings = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.bookings ?? data?.items ?? data);
};

const getId = (b) => b?._id || b?.id;

const getUserName = (b) => b?.user?.name || b?.user?.email || b?.userName || b?.userEmail || '—';

const getPackageTitle = (b) => b?.package?.title || b?.packageTitle || b?.title || '—';

const getPrice = (b) => b?.price ?? b?.package?.price ?? '—';

const getStatus = (b) => String(b?.status || b?.bookingStatus || '—');

export default function BookingsAdmin() {
	useAuth();
	const { showToast } = useToast();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);
	const [busyId, setBusyId] = useState(null);
	const [q, setQ] = useState('');

	const load = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await API.get('/admin/bookings');
			setItems(normalizeBookings(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load bookings';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setItems([]);
			showToast('Failed to load bookings', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const filtered = useMemo(() => {
		const term = q.trim().toLowerCase();
		if (!term) return items;
		return asArray(items).filter((b) => {
			const u = getUserName(b).toLowerCase();
			const p = getPackageTitle(b).toLowerCase();
			const s = getStatus(b).toLowerCase();
			return u.includes(term) || p.includes(term) || s.includes(term);
		});
	}, [items, q]);

	const updateLocal = (id, patch) => {
		setItems((prev) => asArray(prev).map((b) => (getId(b) === id ? { ...b, ...patch } : b)));
	};

	const cancel = async (b) => {
		const id = getId(b);
		if (!id) return;
		setBusyId(id);
		setError('');
		try {
			await API.put(`/admin/bookings/${id}/cancel`);
			updateLocal(id, { status: 'cancelled', bookingStatus: 'cancelled' });
			showToast('Booking cancelled', 'success');
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Cancel failed';
			setError(msg);
			showToast(msg, 'error');
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="space-y-4">
			<AdminTable
				title="Bookings"
				subtitle="Cancel bookings if needed."
				columns={['User', 'Package', 'Price', 'Status', 'Action']}
				loading={loading}
				error={error}
				emptyText="No bookings found."
				right={
					<div className="flex items-center gap-2">
						<input
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Search…"
							className="border rounded px-3 py-2 text-sm"
						/>
						<button onClick={load} className="text-sm font-semibold btn-link">
							Refresh
						</button>
					</div>
				}
			>
				{filtered.length === 0 ? null :
					filtered.map((b) => {
						const id = getId(b);
						const status = getStatus(b);
						const canAct = busyId !== id;
						const isCancelled = status.toLowerCase() === 'cancelled';
						return (
							<tr key={id}>
								<td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900">{getUserName(b)}</td>
								<td className="px-5 py-3 whitespace-nowrap text-gray-700">{getPackageTitle(b)}</td>
								<td className="px-5 py-3 whitespace-nowrap text-gray-700">{getPrice(b)}</td>
								<td className="px-5 py-3 whitespace-nowrap">
									<span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700">
										{status}
									</span>
								</td>
								<td className="px-5 py-3 whitespace-nowrap">
									{isCancelled ? (
										<span className="text-sm text-gray-500">—</span>
									) : (
										<button
											onClick={() => cancel(b)}
											disabled={!canAct}
											className="bg-red-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-60"
										>
											{busyId === id ? 'Cancelling…' : 'Cancel'}
										</button>
									)}
								</td>
							</tr>
						);
					})}
			</AdminTable>

			{!loading && !error && filtered.length === 0 && (
				<div className="bg-white border rounded-xl p-6 text-gray-600">No bookings found.</div>
			)}
		</div>
	);
}
