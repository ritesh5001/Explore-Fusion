import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import AdminTable from '../../components/admin/AdminTable';
import RoleSelect from '../../components/admin/RoleSelect';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeUsers = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.users ?? data?.items ?? data);
};

const getId = (u) => u?._id || u?.id;

const isBlocked = (u) => Boolean(u?.blocked ?? u?.isBlocked ?? u?.status === 'blocked');

export default function UsersAdmin() {
	const { role } = useAuth();
	const isSuperadmin = role === 'superadmin';
	const { showToast } = useToast();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [users, setUsers] = useState([]);
	const [busyId, setBusyId] = useState(null);
	const [q, setQ] = useState('');

	const load = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const res = await API.get('/admin/users');
			setUsers(normalizeUsers(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load users';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setUsers([]);
			showToast('Failed to load users', 'error');
		} finally {
			setLoading(false);
		}
	}, [showToast]);

	useEffect(() => {
		load();
	}, [load]);

	const filtered = useMemo(() => {
		const term = q.trim().toLowerCase();
		if (!term) return users;
		return asArray(users).filter((u) => {
			const name = String(u?.name || '').toLowerCase();
			const email = String(u?.email || '').toLowerCase();
			const r = String(u?.role || '').toLowerCase();
			return name.includes(term) || email.includes(term) || r.includes(term);
		});
	}, [users, q]);

	const updateLocal = (id, patch) => {
		setUsers((prev) => asArray(prev).map((u) => (getId(u) === id ? { ...u, ...patch } : u)));
	};

	const doAction = async (userId, action, fn) => {
		if (!userId) return;
		setBusyId(userId);
		setError('');
		try {
			await fn();
			showToast(action, 'success');
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Action failed';
			setError(msg);
			showToast(msg, 'error');
		} finally {
			setBusyId(null);
		}
	};

	const block = (u) =>
		doAction(getId(u), 'User blocked', async () => {
			await API.put(`/admin/users/${getId(u)}/block`);
			updateLocal(getId(u), { blocked: true, isBlocked: true, status: 'blocked' });
		});

	const unblock = (u) =>
		doAction(getId(u), 'User unblocked', async () => {
			await API.put(`/admin/users/${getId(u)}/unblock`);
			updateLocal(getId(u), { blocked: false, isBlocked: false, status: 'active' });
		});

	const remove = (u) =>
		doAction(getId(u), 'User deleted', async () => {
			await API.delete(`/admin/users/${getId(u)}`);
			setUsers((prev) => asArray(prev).filter((x) => getId(x) !== getId(u)));
		});

	const changeRole = (u, nextRole) =>
		doAction(getId(u), 'Role updated', async () => {
			await API.put(`/admin/users/${getId(u)}/role`, { role: nextRole });
			updateLocal(getId(u), { role: nextRole });
		});

	return (
		<div className="space-y-4">
			<AdminTable
				title="Users"
				subtitle="Block/unblock users. Superadmin can change roles and delete users."
				columns={['Name', 'Email', 'Role', 'Status', 'Actions']}
				loading={loading}
				error={error}
				emptyText="No users found."
				onRetry={load}
				mobileCards={
					<div className="space-y-3">
						{filtered.map((u) => {
							const id = getId(u);
							const blocked = isBlocked(u);
							const canEdit = busyId !== id;
							return (
								<Card key={id} className="p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="font-semibold text-mountain dark:text-sand truncate">{u?.name || '—'}</div>
											<div className="text-sm text-charcoal/70 dark:text-sand/70 truncate">{u?.email || '—'}</div>
											<div className="mt-2 text-sm text-charcoal/70 dark:text-sand/70">
												Role:{' '}
												{isSuperadmin ? (
													<RoleSelect value={u?.role || 'user'} disabled={!canEdit} onChange={(r) => changeRole(u, r)} />
												) : (
													<span className="font-semibold text-charcoal dark:text-sand">{u?.role || 'user'}</span>
												)}
											</div>
											<div className="mt-2">
												<Badge tone={blocked ? 'danger' : 'success'}>{blocked ? 'Blocked' : 'Active'}</Badge>
											</div>
									</div>
								</div>

								<div className="mt-4 flex items-center gap-2">
									<Button
										variant="primary"
										size="sm"
										onClick={() => (blocked ? unblock(u) : block(u))}
										disabled={!canEdit}
										aria-label={blocked ? 'Unblock user' : 'Block user'}
									>
										{blocked ? 'Unblock' : 'Block'}
									</Button>
									{isSuperadmin && (
										<Button
											variant="danger"
											size="sm"
											onClick={() => remove(u)}
											disabled={!canEdit}
											aria-label="Delete user"
										>
											Delete
										</Button>
									)}
									{busyId === id && <span className="text-xs text-charcoal/60 dark:text-sand/60">Working…</span>}
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
							<Button variant="outline" size="sm" onClick={load} aria-label="Refresh users">
							Refresh
						</Button>
					</div>
				}
			>
				{filtered.length === 0 ? null :
					filtered.map((u) => {
						const id = getId(u);
						const blocked = isBlocked(u);
						const canEdit = busyId !== id;
						return (
							<tr key={id} className="align-middle">
								<td className="px-5 py-3 whitespace-nowrap font-semibold text-mountain dark:text-sand">{u?.name || '—'}</td>
								<td className="px-5 py-3 whitespace-nowrap text-charcoal/80 dark:text-sand/80">{u?.email || '—'}</td>
								<td className="px-5 py-3 whitespace-nowrap">
									{isSuperadmin ? (
										<RoleSelect
											value={u?.role || 'user'}
											disabled={!canEdit}
											onChange={(r) => changeRole(u, r)}
										/>
									) : (
										<span className="text-charcoal/80 dark:text-sand/80 font-semibold">{u?.role || 'user'}</span>
									)}
								</td>
								<td className="px-5 py-3 whitespace-nowrap">
									<Badge tone={blocked ? 'danger' : 'success'}>{blocked ? 'Blocked' : 'Active'}</Badge>
								</td>
								<td className="px-5 py-3 whitespace-nowrap">
									<div className="flex items-center gap-2">
										{blocked ? (
											<Button onClick={() => unblock(u)} disabled={!canEdit} size="sm" aria-label="Unblock user">
												Unblock
											</Button>
										) : (
											<Button onClick={() => block(u)} disabled={!canEdit} size="sm" aria-label="Block user">
												Block
											</Button>
										)}

										{isSuperadmin && (
											<Button onClick={() => remove(u)} disabled={!canEdit} variant="danger" size="sm" aria-label="Delete user">
												Delete
											</Button>
										)}

										{busyId === id && <span className="text-xs text-charcoal/60 dark:text-sand/60">Working…</span>}
									</div>
								</td>
							</tr>
						);
					})}
			</AdminTable>
		</div>
	);
}
