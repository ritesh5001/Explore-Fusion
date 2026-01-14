import { cn } from '../../utils/cn';

const ROLES = ['user', 'creator', 'admin', 'superadmin'];

export default function RoleSelect({ value, onChange, disabled }) {
	return (
		<select
			value={value || 'user'}
			onChange={(e) => onChange?.(e.target.value)}
			disabled={disabled}
			className={cn(
				'rounded-2xl border px-3 py-2 text-sm font-semibold',
				'bg-white/70 backdrop-blur-md border-soft text-charcoal',
				'focus:outline-none focus:ring-2 focus:ring-trail/35 focus:border-trail/40',
				'dark:bg-white/5 dark:border-white/10 dark:text-sand',
				disabled ? 'opacity-60 cursor-not-allowed' : ''
			)}
		>
			{ROLES.map((r) => (
				<option key={r} value={r}>
					{r}
				</option>
			))}
		</select>
	);
}
