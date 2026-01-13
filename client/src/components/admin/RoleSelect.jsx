const ROLES = ['user', 'creator', 'admin', 'superadmin'];

export default function RoleSelect({ value, onChange, disabled }) {
	return (
		<select
			value={value || 'user'}
			onChange={(e) => onChange?.(e.target.value)}
			disabled={disabled}
			className="border rounded px-2 py-1 text-sm bg-white disabled:opacity-60"
		>
			{ROLES.map((r) => (
				<option key={r} value={r}>
					{r}
				</option>
			))}
		</select>
	);
}
