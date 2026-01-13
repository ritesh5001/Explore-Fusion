import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/useAuth';
import { useSystem } from '../../context/SystemContext';

const NavItem = ({ to, label }) => (
	<NavLink
		to={to}
		className={({ isActive }) =>
			`block rounded-lg px-3 py-2 text-sm font-semibold transition ` +
			(isActive ? 'bg-forest text-white shadow-sm' : 'text-charcoal hover:bg-soft/70')
		}
	>
		{label}
	</NavLink>
);

export default function AdminLayout({ children }) {
	const navigate = useNavigate();
	const { user, role, logout } = useAuth();
	const { maintenanceMode, readOnlyMode } = useSystem();

	const onLogout = () => {
		logout();
		navigate('/login', { replace: true });
	};

	return (
		<div className="min-h-[calc(100vh-120px)] bg-sand">
			<div className="container-app py-6">
				<div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
					<aside className="glass-card p-4 h-fit">
						<div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Admin Panel</div>
						<div className="mt-2 font-heading font-bold text-mountain truncate">{user?.name || user?.email || 'Admin'}</div>
						<div className="text-sm text-gray-700 mt-1">Role: {role || '—'}</div>

						<div className="mt-4 space-y-1">
							<NavItem to="/admin/dashboard" label="Dashboard" />
							<NavItem to="/admin/users" label="Users" />
							<NavItem to="/admin/creators" label="Creators" />
							<NavItem to="/admin/bookings" label="Bookings" />
							<NavItem to="/admin/analytics" label="Analytics" />
							{role === 'superadmin' && <NavItem to="/admin/reports" label="Reports" />}
							{role === 'superadmin' && <NavItem to="/admin/system" label="System" />}
						</div>
					</aside>

					<section className="min-w-0">
						{(maintenanceMode || readOnlyMode) && (
							<div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 shadow-sm">
								<div className="text-sm font-semibold text-amber-900">System warning (simulated)</div>
								<div className="text-sm text-amber-800 mt-1">
									{maintenanceMode && <span className="mr-3">Maintenance mode enabled</span>}
									{readOnlyMode && <span>Read-only mode enabled</span>}
								</div>
							</div>
						)}
						<header className="glass-card px-5 py-4 flex items-center justify-between gap-4">
							<div>
								<div className="text-sm text-gray-600">Explore Fusion</div>
								<div className="font-heading font-extrabold tracking-tight text-mountain">Admin</div>
							</div>
							<button
								onClick={onLogout}
								className="text-sm font-semibold text-red-600 hover:text-red-800"
							>
								Logout
							</button>
						</header>

						<div className="mt-6">{children}</div>
					</section>
				</div>
			</div>
		</div>
	);
}
