import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import ReportCard from '../../components/admin/ReportCard';
import AdminTable from '../../components/admin/AdminTable';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Loader';

const pick = (obj, keys) => {
	for (const k of keys) {
		const v = obj?.[k];
		if (v !== undefined && v !== null) return v;
	}
	return undefined;
};

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeActions = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.recentActions ?? data?.actions ?? data?.logs ?? data?.events ?? []);
};

const fmtNumber = (v) => {
	if (v === null || v === undefined || v === '') return '—';
	if (typeof v === 'number') return new Intl.NumberFormat().format(v);
	return String(v);
};

const fmtMoney = (v) => {
	if (v === null || v === undefined || v === '') return '—';
	const n = Number(v);
	if (Number.isFinite(n)) {
		return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
	}
	return String(v);
};

const fmtTime = (v) => {
	if (!v) return '—';
	const d = new Date(v);
	if (Number.isNaN(d.getTime())) return '—';
	return d.toLocaleString();
};

const actionLabel = (row) => {
	const raw = row?.action || row?.type || row?.event || row?.name;
	if (!raw) return '—';
	const s = String(raw);
	const map = {
		'user_blocked': 'User blocked',
		'user_unblocked': 'User unblocked',
		'booking_cancelled': 'Booking cancelled',
		'role_changed': 'Role changed',
	};
	return map[s] || s.replaceAll('_', ' ');
};

export default function AdminReports() {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [data, setData] = useState(null);
	const [actions, setActions] = useState([]);

	const load = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const res = await API.get('/admin/reports/system');
			const payload = res?.data?.data ?? res?.data ?? null;
			setData(payload);
			setActions(normalizeActions(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load system reports';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setData(null);
			setActions([]);
			showToast('Failed to load system reports', 'error');
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
		const revenue = pick(data, ['revenueSummary', 'revenue', 'totalRevenue', 'earnings']);
		const blockedUsers = pick(data, ['blockedUsers', 'blockedUserCount', 'blocked']);
		return { totalUsers, totalCreators, totalBookings, revenue, blockedUsers };
	}, [data]);

	return (
		<div className="space-y-4">
			<SectionHeader
				title="System Reports"
				subtitle="Superadmin-only overview and audit-style actions."
				action={
					<Button variant="outline" size="sm" onClick={load} aria-label="Refresh reports">
						Refresh
					</Button>
				}
			/>

			{loading ? (
				<div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<Card key={i} className="p-6">
							<Skeleton className="h-3 w-28" />
							<div className="mt-3">
								<Skeleton className="h-7 w-24" />
							</div>
						</Card>
					))}
				</div>
			) : error ? (
				<ErrorState title="Couldn’t load reports" description={error} onRetry={load} />
			) : (
				<div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
					<ReportCard title="Total Users" value={fmtNumber(stats.totalUsers)} />
					<ReportCard title="Total Creators" value={fmtNumber(stats.totalCreators)} />
					<ReportCard title="Total Bookings" value={fmtNumber(stats.totalBookings)} />
					<ReportCard title="Revenue Summary" value={fmtMoney(stats.revenue)} hint="From /admin/reports/system" />
					<ReportCard title="Blocked Users" value={fmtNumber(stats.blockedUsers)} />
				</div>
			)}

			<AdminTable
				title="Recent critical actions"
				subtitle="Audit-style view of important admin actions."
				columns={['Action', 'Actor', 'Target', 'Time', 'Details']}
				loading={loading}
				error={error}
				emptyText="No critical actions found."
			>
				{actions.length === 0
					? null
					: actions.map((row, idx) => {
						const actor = row?.actor?.email || row?.actor?.name || row?.performedBy || row?.adminEmail || row?.admin || '—';
						const target = row?.target?.email || row?.target?.name || row?.userEmail || row?.user || row?.bookingId || row?.targetId || '—';
						const time = fmtTime(row?.createdAt || row?.timestamp || row?.time);
						const details = row?.details || row?.reason || row?.message || row?.meta;
						return (
							<tr key={row?._id || row?.id || `${idx}`} className="align-middle">
								<td className="px-5 py-3 whitespace-nowrap font-semibold text-mountain dark:text-sand">{actionLabel(row)}</td>
								<td className="px-5 py-3 whitespace-nowrap text-charcoal/80 dark:text-sand/80">{String(actor)}</td>
								<td className="px-5 py-3 whitespace-nowrap text-charcoal/80 dark:text-sand/80">{String(target)}</td>
								<td className="px-5 py-3 whitespace-nowrap text-charcoal/80 dark:text-sand/80">{time}</td>
								<td className="px-5 py-3 text-charcoal/80 dark:text-sand/80">
									{details && typeof details === 'object' ? (
										<pre className="text-xs bg-sand/70 dark:bg-white/5 border border-soft/80 dark:border-white/10 rounded-2xl p-3 overflow-x-auto">{JSON.stringify(details, null, 2)}</pre>
									) : (
										<span className="text-sm">{details ? String(details) : '—'}</span>
									)}
								</td>
							</tr>
						);
					})}
			</AdminTable>
		</div>
	);
}
