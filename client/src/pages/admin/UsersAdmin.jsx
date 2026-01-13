import { useEffect, useMemo, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import AdminTable from '../../components/admin/AdminTable';
import RoleSelect from '../../components/admin/RoleSelect';

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

	const load = async () => {
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
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
				right={
					<div className="flex items-center gap-2">
						<input
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Search…"
							className="border rounded px-3 py-2 text-sm"
						/>
							<button onClick={load} className="btn-link text-sm">
							Refresh
						</button>
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
								<td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900">{u?.name || '—'}</td>
								<td className="px-5 py-3 whitespace-nowrap text-gray-700">{u?.email || '—'}</td>
								<td className="px-5 py-3 whitespace-nowrap">
									{isSuperadmin ? (
										<RoleSelect
											value={u?.role || 'user'}
											disabled={!canEdit}
											onChange={(r) => changeRole(u, r)}
										/>
									) : (
										<span className="text-gray-700">{u?.role || 'user'}</span>
									)}
								</td>
								<td className="px-5 py-3 whitespace-nowrap">
									<span
										className={
											`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ` +
											(blocked ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-700')
										}
									>
										{blocked ? 'Blocked' : 'Active'}
									</span>
								</td>
								<td className="px-5 py-3 whitespace-nowrap">
									<div className="flex items-center gap-2">
										{blocked ? (
											<button
												onClick={() => unblock(u)}
												disabled={!canEdit}
												className="btn-primary px-3 py-1.5"
											>
												Unblock
											</button>
										) : (
											<button
												onClick={() => block(u)}
												disabled={!canEdit}
												className="btn-primary px-3 py-1.5"
											>
												Block
											</button>
										)}

										{isSuperadmin && (
											<button
												onClick={() => remove(u)}
												disabled={!canEdit}
												className="bg-red-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-60"
											>
												Delete
											</button>
										)}

										{busyId === id && <span className="text-xs text-gray-500">Working…</span>}
									</div>
								</td>
							</tr>
						);
					})}
			</AdminTable>

			{!loading && !error && filtered.length === 0 && (
				<div className="bg-white border rounded-xl p-6 text-gray-600">No users found.</div>
			)}
		</div>
	);
}
