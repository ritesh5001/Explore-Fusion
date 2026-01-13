import { useEffect, useMemo, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import StatCard from '../../components/admin/StatCard';

const pick = (obj, keys) => {
	for (const k of keys) {
		const v = obj?.[k];
		if (v !== undefined && v !== null) return v;
	}
	return undefined;
};

export default function AdminDashboard() {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [data, setData] = useState(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError('');
			try {
				const res = await API.get('/admin/dashboard');
				setData(res?.data?.data ?? res?.data ?? null);
			} catch (e) {
				const status = e?.response?.status;
				const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load dashboard';
				setError(msg + (status ? ` (HTTP ${status})` : ''));
				showToast('Failed to load admin dashboard', 'error');
				setData(null);
			} finally {
				setLoading(false);
			}
		};

		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const stats = useMemo(() => {
		const totalUsers = pick(data, ['totalUsers', 'users', 'userCount']);
		const totalCreators = pick(data, ['totalCreators', 'creators', 'creatorCount']);
		const totalBookings = pick(data, ['totalBookings', 'bookings', 'bookingCount']);
		const revenue = pick(data, ['revenue', 'totalRevenue', 'earnings']);
		return { totalUsers, totalCreators, totalBookings, revenue };
	}, [data]);

	return (
		<div>
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-2xl font-bold">Dashboard</h1>
			</div>

			{loading ? (
				<div className="bg-white border rounded-xl p-6 text-gray-600">Loading stats…</div>
			) : error ? (
				<div className="bg-white border rounded-xl p-6">
					<div className="text-red-600 font-semibold">Error</div>
					<div className="text-gray-700 text-sm mt-1">{error}</div>
				</div>
			) : (
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard title="Total Users" value={stats.totalUsers ?? '—'} />
					<StatCard title="Total Creators" value={stats.totalCreators ?? '—'} />
					<StatCard title="Total Bookings" value={stats.totalBookings ?? '—'} />
					<StatCard title="Revenue / Stats" value={stats.revenue ?? '—'} />
				</div>
			)}

			<div className="mt-6 bg-white border rounded-xl p-6">
				<div className="font-semibold text-gray-900">Next steps</div>
				<div className="text-sm text-gray-600 mt-1">
					User/Creator/Booking management pages ship in Sprint 2.
				</div>
			</div>
		</div>
	);
}
