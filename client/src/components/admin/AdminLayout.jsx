import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/useAuth';
import { useSystem } from '../../context/SystemContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const NavItem = ({ to, label }) => (
	<NavLink
		to={to}
		className={({ isActive }) =>
			`block rounded-2xl px-3 py-2 text-sm font-semibold transition ` +
			(isActive
				? 'bg-trail/15 text-trail border border-trail/25'
				: 'text-charcoal/80 dark:text-sand/80 hover:bg-soft/60 dark:hover:bg-white/10 border border-transparent')
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
		<div className="min-h-[calc(100vh-120px)] bg-sand dark:bg-charcoal">
			<div className="container-app py-6">
				<div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
					<aside className="h-fit">
						<Card className="p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<div className="text-xs font-bold text-charcoal/60 dark:text-sand/60 uppercase tracking-wide">Admin Panel</div>
									<div className="mt-2 font-heading font-extrabold tracking-tight text-mountain dark:text-sand truncate">
										{user?.name || user?.email || 'Admin'}
									</div>
								</div>
								<Badge tone="accent">{role || 'admin'}</Badge>
							</div>

							<div className="mt-4 space-y-1">
								<NavItem to="/admin/dashboard" label="Dashboard" />
								<NavItem to="/admin/users" label="Users" />
								<NavItem to="/admin/creators" label="Creators" />
								<NavItem to="/admin/bookings" label="Bookings" />
								<NavItem to="/admin/analytics" label="Analytics" />
								{role === 'superadmin' && <NavItem to="/admin/reports" label="Reports" />}
								{role === 'superadmin' && <NavItem to="/admin/system" label="System" />}
							</div>

							<div className="mt-5">
								<Button variant="danger" size="sm" onClick={onLogout} className="w-full">
									Logout
								</Button>
							</div>
						</Card>
					</aside>

					<section className="min-w-0">
						{(maintenanceMode || readOnlyMode) && (
							<div className="mb-4 rounded-2xl border border-adventure/35 bg-adventure/10 px-5 py-3 shadow-sm">
								<div className="text-sm font-semibold text-adventure">System status</div>
								<div className="text-sm text-charcoal/80 dark:text-sand/80 mt-1">
									{maintenanceMode && <span className="mr-3">Maintenance mode enabled</span>}
									{readOnlyMode && <span>Read-only mode enabled</span>}
								</div>
							</div>
						)}
						<header className="glass-card px-5 py-4 flex items-center justify-between gap-4">
							<div>
								<div className="text-sm text-charcoal/60 dark:text-sand/60">Explore Fusion</div>
								<div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Admin</div>
							</div>
							<Badge tone="gold">Analytics</Badge>
						</header>

						<div className="mt-6">{children}</div>
					</section>
				</div>
			</div>
		</div>
	);
}
