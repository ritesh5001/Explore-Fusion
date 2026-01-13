import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import SystemToggle from '../../components/admin/SystemToggle';
import { useSystem } from '../../context/SystemContext';

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
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">System Control Panel</h1>
					<div className="text-sm text-gray-600 mt-1">Superadmin-only controls. These toggles are frontend-only simulations.</div>
				</div>
			</div>

			{(maintenanceMode || readOnlyMode) && (
				<div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
					<div className="font-semibold text-amber-900">Warning banner (simulated)</div>
					<div className="text-sm text-amber-800 mt-1">
						{maintenanceMode && <div>• Maintenance mode is enabled</div>}
						{readOnlyMode && <div>• Read-only mode is enabled</div>}
						<div className="mt-2 text-amber-800">This state is stored in localStorage for this browser only.</div>
					</div>
				</div>
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

			<div className="bg-white border rounded-xl p-5">
				<div className="font-bold text-gray-900">Notes</div>
				<ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
					<li>No backend toggle API exists yet (per requirements).</li>
					<li>Use these flags to validate UI behavior and admin workflows.</li>
				</ul>
			</div>
		</div>
	);
}
