import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import SystemToggle from '../../components/admin/SystemToggle';
import { useSystem } from '../../context/SystemContext';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function AdminSystem() {
	const { role } = useAuth();
	const { showToast } = useToast();
	const { maintenanceMode, readOnlyMode, setMaintenanceMode, setReadOnlyMode } = useSystem();

	const isSuperadmin = role === 'superadmin';

	const setMaint = (next) => {
		setMaintenanceMode(Boolean(next));
		showToast(`Maintenance mode ${next ? 'enabled' : 'disabled'} (simulated)`, 'success');
	};

	const setReadOnly = (next) => {
		setReadOnlyMode(Boolean(next));
		showToast(`Read-only mode ${next ? 'enabled' : 'disabled'} (simulated)`, 'success');
	};

	return (
		<div className="space-y-4">
			<SectionHeader
				title="System Control Panel"
				subtitle="Superadmin-only controls. These toggles are frontend-only simulations."
				action={<Badge tone={isSuperadmin ? 'accent' : 'default'}>{isSuperadmin ? 'Superadmin' : 'Read-only'}</Badge>}
			/>

			{(maintenanceMode || readOnlyMode) && (
				<Card className="p-5 border border-adventure/35 bg-adventure/10">
					<div className="flex items-center gap-2">
						<Badge tone="gold">Simulated</Badge>
						<div className="font-heading font-extrabold tracking-tight text-adventure">System banner</div>
					</div>
					<div className="text-sm text-charcoal/80 dark:text-sand/80 mt-2">
						{maintenanceMode && <div>• Maintenance mode is enabled</div>}
						{readOnlyMode && <div>• Read-only mode is enabled</div>}
						<div className="mt-2 text-charcoal/70 dark:text-sand/70">This state is stored in localStorage for this browser only.</div>
					</div>
				</Card>
			)}

			<SystemToggle
				label="Maintenance Mode"
				description="Shows a warning banner across the admin panel. No backend changes are made."
				enabled={maintenanceMode}
				onChange={setMaint}
				disabled={!isSuperadmin}
			/>

			<SystemToggle
				label="Read-only Mode"
				description="UI-only flag that can be used to disable destructive actions (future)."
				enabled={readOnlyMode}
				onChange={setReadOnly}
				disabled={!isSuperadmin}
			/>

			<Card className="p-5">
				<div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Notes</div>
				<ul className="mt-2 text-sm text-charcoal/70 dark:text-sand/70 list-disc pl-5 space-y-1">
					<li>No backend toggle API exists yet (per requirements).</li>
					<li>Use these flags to validate UI behavior and admin workflows.</li>
				</ul>
			</Card>
		</div>
	);
}
