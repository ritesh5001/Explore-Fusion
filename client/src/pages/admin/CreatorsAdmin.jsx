import { useEffect, useMemo, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import AdminTable from '../../components/admin/AdminTable';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeCreators = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.creators ?? data?.items ?? data);
};

const getId = (c) => c?._id || c?.id;

const isVerified = (c) => Boolean(c?.verified ?? c?.isVerified ?? c?.status === 'verified');

export default function CreatorsAdmin() {
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
			const res = await API.get('/admin/creators');
			setItems(normalizeCreators(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load creators';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setItems([]);
			showToast('Failed to load creators', 'error');
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
		return asArray(items).filter((c) => {
			const name = String(c?.name || '').toLowerCase();
			const email = String(c?.email || '').toLowerCase();
			return name.includes(term) || email.includes(term);
		});
	}, [items, q]);

	const updateLocal = (id, patch) => {
		setItems((prev) => asArray(prev).map((c) => (getId(c) === id ? { ...c, ...patch } : c)));
	};

	const verify = async (c) => {
		const id = getId(c);
		if (!id) return;
		setBusyId(id);
		setError('');
		try {
			await API.put(`/admin/creators/${id}/verify`);
			updateLocal(id, { verified: true, isVerified: true, status: 'verified' });
			showToast('Creator verified', 'success');
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Verify failed';
			setError(msg);
			showToast(msg, 'error');
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="space-y-4">
			<AdminTable
				title="Creators"
				subtitle="Verify creators so they can publish packages."
				columns={['Name', 'Email', 'Verified', 'Action']}
				loading={loading}
				error={error}
				emptyText="No creators found."
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
					filtered.map((c) => {
						const id = getId(c);
						const verified = isVerified(c);
						const canAct = busyId !== id;
						return (
							<tr key={id}>
								<td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900">{c?.name || '—'}</td>
								<td className="px-5 py-3 whitespace-nowrap text-gray-700">{c?.email || '—'}</td>
								<td className="px-5 py-3 whitespace-nowrap">
									<span
										className={
											`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ` +
											(verified ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700')
										}
									>
										{verified ? 'Verified' : 'Not verified'}
									</span>
								</td>
								<td className="px-5 py-3 whitespace-nowrap">
									{verified ? (
										<span className="text-sm text-gray-500">—</span>
									) : (
										<button
											onClick={() => verify(c)}
											disabled={!canAct}
											className="btn-primary px-3 py-1.5"
										>
											{busyId === id ? 'Verifying…' : 'Verify'}
										</button>
									)}
								</td>
							</tr>
						);
					})}
			</AdminTable>

			{!loading && !error && filtered.length === 0 && (
				<div className="bg-white border rounded-xl p-6 text-gray-600">No creators found.</div>
			)}
		</div>
	);
}
