import { useEffect, useMemo, useState } from 'react';
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

	useEffect(() => {
		const load = async () => {
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
		};

		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Platform Analytics</h1>
					<div className="text-sm text-gray-600 mt-1">Uses the existing /admin/dashboard endpoint for stats.</div>
				</div>
			</div>

			{loading ? (
				<div className="bg-white border rounded-xl p-6 text-gray-600">Loading analytics…</div>
			) : error ? (
				<div className="bg-white border rounded-xl p-6">
					<div className="text-red-600 font-semibold">Error</div>
					<div className="text-gray-700 text-sm mt-1">{error}</div>
				</div>
			) : (
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<ReportCard title="Total Users" value={snapshot.totalUsers ?? '—'} />
					<ReportCard title="Total Creators" value={snapshot.totalCreators ?? '—'} />
					<ReportCard title="Total Bookings" value={snapshot.totalBookings ?? '—'} />
					<ReportCard title="Revenue / Stats" value={snapshot.revenue ?? '—'} />
				</div>
			)}

			{!loading && !error && !hasTrends && (
				<div className="bg-white border rounded-xl p-6">
					<div className="font-semibold text-gray-900">Trends unavailable</div>
					<div className="text-sm text-gray-600 mt-1">
						Trends available once more data is collected.
					</div>
				</div>
			)}

			{!loading && !error && hasTrends && (
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
					<div className="bg-white border rounded-xl p-5">
						<div className="font-bold text-gray-900">Users growth</div>
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
					</div>

					<div className="bg-white border rounded-xl p-5">
						<div className="font-bold text-gray-900">Bookings trend</div>
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
					</div>

					<div className="bg-white border rounded-xl p-5">
						<div className="font-bold text-gray-900">Creator onboarding</div>
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
					</div>
				</div>
			)}
		</div>
	);
}
