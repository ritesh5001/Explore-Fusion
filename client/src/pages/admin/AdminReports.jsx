import { useEffect, useMemo, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import ReportCard from '../../components/admin/ReportCard';
import AdminTable from '../../components/admin/AdminTable';

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

	useEffect(() => {
		const load = async () => {
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
		};
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">System Reports</h1>
					<div className="text-sm text-gray-600 mt-1">Superadmin-only overview and audit-style actions.</div>
				</div>
				<button
					onClick={() => window.location.reload()}
					className="text-sm font-semibold btn-link"
				>
					Refresh
				</button>
			</div>

			{loading ? (
				<div className="bg-white border rounded-xl p-6 text-gray-600">Loading reports…</div>
			) : error ? (
				<div className="bg-white border rounded-xl p-6">
					<div className="text-red-600 font-semibold">Error</div>
					<div className="text-gray-700 text-sm mt-1">{error}</div>
				</div>
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
								<td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900">{actionLabel(row)}</td>
								<td className="px-5 py-3 whitespace-nowrap text-gray-700">{String(actor)}</td>
								<td className="px-5 py-3 whitespace-nowrap text-gray-700">{String(target)}</td>
								<td className="px-5 py-3 whitespace-nowrap text-gray-700">{time}</td>
								<td className="px-5 py-3 text-gray-700">
									{details && typeof details === 'object' ? (
										<pre className="text-xs bg-gray-50 border rounded p-2 overflow-x-auto">{JSON.stringify(details, null, 2)}</pre>
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
