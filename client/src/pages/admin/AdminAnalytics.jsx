import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	BarChart,
	Bar,
} from 'recharts';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import ReportCard from '../../components/admin/ReportCard';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Loader';

const pick = (obj, keys) => {
	for (const k of keys) {
		const v = obj?.[k];
		if (v !== undefined && v !== null) return v;
	}
	return undefined;
};

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeSeries = (raw, labelPrefix = 'T') => {
	if (!raw) return [];
	const arr = asArray(raw);
	if (arr.length === 0) return [];

	if (typeof arr[0] === 'number') {
		return arr.map((n, i) => ({ label: `${labelPrefix}${i + 1}`, value: Number(n) }));
	}

	if (typeof arr[0] === 'string') {
		return arr.map((s, i) => ({ label: `${labelPrefix}${i + 1}`, value: Number(s) || 0 }));
	}

	if (typeof arr[0] === 'object') {
		return arr.map((row, i) => {
			const label = row?.label || row?.date || row?.day || row?.month || row?.name || `${labelPrefix}${i + 1}`;
			const value = row?.value ?? row?.count ?? row?.total ?? row?.users ?? row?.bookings ?? row?.creators;
			return { label: String(label), value: Number(value) || 0 };
		});
	}

	return [];
};

export default function AdminAnalytics() {
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
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load analytics';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setData(null);
			showToast('Failed to load analytics', 'error');
		} finally {
			setLoading(false);
		}
	}, [showToast]);

	useEffect(() => {
		load();
	}, [load]);

	const snapshot = useMemo(() => {
		const totalUsers = pick(data, ['totalUsers', 'users', 'userCount']);
		const totalCreators = pick(data, ['totalCreators', 'creators', 'creatorCount']);
		const totalBookings = pick(data, ['totalBookings', 'bookings', 'bookingCount']);
		const revenue = pick(data, ['revenue', 'totalRevenue', 'earnings']);
		return { totalUsers, totalCreators, totalBookings, revenue };
	}, [data]);

	const series = useMemo(() => {
		const usersRaw = pick(data, ['usersGrowth', 'userGrowth', 'usersTrend', 'usersOverTime', 'userSeries']);
		const bookingsRaw = pick(data, ['bookingsTrend', 'bookingTrend', 'bookingsOverTime', 'bookingSeries']);
		const creatorsRaw = pick(data, ['creatorOnboarding', 'creatorsTrend', 'creatorsOverTime', 'creatorSeries']);
		return {
			users: normalizeSeries(usersRaw, 'U'),
			bookings: normalizeSeries(bookingsRaw, 'B'),
			creators: normalizeSeries(creatorsRaw, 'C'),
		};
	}, [data]);

	const hasTrends = series.users.length > 1 || series.bookings.length > 1 || series.creators.length > 1;

	return (
		<div className="space-y-4">
			<SectionHeader
				title="Platform Analytics"
				subtitle="Uses the existing /admin/dashboard endpoint for stats."
				action={
					<button
						type="button"
						onClick={load}
						className="text-sm font-semibold text-trail hover:underline"
					>
						Refresh
					</button>
				}
			/>

			{loading ? (
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i} className="p-6">
							<Skeleton className="h-3 w-28" />
							<div className="mt-3">
								<Skeleton className="h-7 w-24" />
							</div>
						</Card>
					))}
				</div>
			) : error ? (
				<ErrorState title="Couldn’t load analytics" description={error} onRetry={load} />
			) : !data ? (
				<EmptyState title="No analytics available" description="The dashboard endpoint returned no payload." onAction={load} actionLabel="Retry" />
			) : (
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<ReportCard title="Total Users" value={snapshot.totalUsers ?? '—'} />
					<ReportCard title="Total Creators" value={snapshot.totalCreators ?? '—'} />
					<ReportCard title="Total Bookings" value={snapshot.totalBookings ?? '—'} />
					<ReportCard title="Revenue / Stats" value={snapshot.revenue ?? '—'} />
				</div>
			)}

			{!loading && !error && !hasTrends && (
				<Card className="p-6">
					<div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Trends unavailable</div>
					<div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1">
						Trends available once more data is collected.
					</div>
				</Card>
			)}

			{!loading && !error && hasTrends && (
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
					<Card className="p-5">
						<div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Users growth</div>
						<div className="mt-4 h-64">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={series.users} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="label" />
									<YAxis />
									<Tooltip />
									<Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</Card>

					<Card className="p-5">
						<div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Bookings trend</div>
						<div className="mt-4 h-64">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={series.bookings} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="label" />
									<YAxis />
									<Tooltip />
									<Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</Card>

					<Card className="p-5">
						<div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Creator onboarding</div>
						<div className="mt-4 h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={series.creators} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="label" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}
