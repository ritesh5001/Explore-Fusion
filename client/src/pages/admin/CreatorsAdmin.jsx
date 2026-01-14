import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import AdminTable from '../../components/admin/AdminTable';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

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

	const load = useCallback(async () => {
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
	}, [showToast]);

	useEffect(() => {
		load();
	}, [load]);

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
				onRetry={load}
				mobileCards={
					<div className="space-y-3">
						{filtered.map((c) => {
							const id = getId(c);
							const verified = isVerified(c);
							const canAct = busyId !== id;
							return (
								<Card key={id} className="p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="font-semibold text-mountain dark:text-sand truncate">{c?.name || '—'}</div>
											<div className="text-sm text-charcoal/70 dark:text-sand/70 truncate">{c?.email || '—'}</div>
											<div className="mt-2">
												<Badge tone={verified ? 'success' : 'default'}>{verified ? 'Verified' : 'Not verified'}</Badge>
											</div>
										</div>
										{verified ? (
											<span className="text-sm text-charcoal/60 dark:text-sand/60">—</span>
										) : (
											<Button
												onClick={() => verify(c)}
												disabled={!canAct}
												size="sm"
												aria-label="Verify creator"
											>
												{busyId === id ? 'Verifying…' : 'Verify'}
											</Button>
										)}
									</div>
							</Card>
							);
						})}
					</div>
				}
				right={
					<div className="flex items-center gap-2">
						<div className="w-64">
							<Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
						</div>
						<Button variant="outline" size="sm" onClick={load} aria-label="Refresh creators">
							Refresh
						</Button>
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
								<td className="px-5 py-3 whitespace-nowrap font-semibold text-mountain dark:text-sand">{c?.name || '—'}</td>
								<td className="px-5 py-3 whitespace-nowrap text-charcoal/80 dark:text-sand/80">{c?.email || '—'}</td>
								<td className="px-5 py-3 whitespace-nowrap">
									<Badge tone={verified ? 'success' : 'default'}>{verified ? 'Verified' : 'Not verified'}</Badge>
								</td>
								<td className="px-5 py-3 whitespace-nowrap">
									{verified ? (
										<span className="text-sm text-charcoal/60 dark:text-sand/60">—</span>
									) : (
										<Button onClick={() => verify(c)} disabled={!canAct} size="sm" aria-label="Verify creator">
											{busyId === id ? 'Verifying…' : 'Verify'}
										</Button>
									)}
								</td>
							</tr>
						);
					})}
			</AdminTable>
		</div>
	);
}
