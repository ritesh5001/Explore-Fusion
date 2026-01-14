import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import StatCard from '../../components/admin/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loader';

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

	const load = useCallback(async () => {
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
	}, [showToast]);

	useEffect(() => {
		load();
	}, [load]);

	const stats = useMemo(() => {
		const totalUsers = pick(data, ['totalUsers', 'users', 'userCount']);
		const totalCreators = pick(data, ['totalCreators', 'creators', 'creatorCount']);
		const totalBookings = pick(data, ['totalBookings', 'bookings', 'bookingCount']);
		const revenue = pick(data, ['revenue', 'totalRevenue', 'earnings']);
		return { totalUsers, totalCreators, totalBookings, revenue };
	}, [data]);

	return (
		<div>
			<SectionHeader
				title="Dashboard"
				subtitle="Operational overview from the existing /admin/dashboard endpoint."
				action={
					<Button variant="outline" size="sm" onClick={load} aria-label="Refresh dashboard">
						Refresh
					</Button>
				}
			/>

			<div className="mt-5">
				{loading ? (
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Card key={i} className="p-6">
								<Skeleton className="h-3 w-28" />
								<div className="mt-3">
									<Skeleton className="h-8 w-24" />
								</div>
							</Card>
						))}
					</div>
				) : error ? (
					<ErrorState title="Couldn’t load dashboard" description={error} onRetry={load} />
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<StatCard title="Total Users" value={stats.totalUsers ?? '—'} />
						<StatCard title="Total Creators" value={stats.totalCreators ?? '—'} />
						<StatCard title="Total Bookings" value={stats.totalBookings ?? '—'} />
						<StatCard title="Revenue / Stats" value={stats.revenue ?? '—'} />
					</div>
				)}
			</div>

			<Card className="mt-6 p-6">
				<div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Next steps</div>
				<div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1">
					User/Creator/Booking management pages ship in Sprint 2.
				</div>
			</Card>
		</div>
	);
}
