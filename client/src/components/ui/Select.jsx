import { cn } from '../../utils/cn';

export default function Select({
	label,
	id,
	error,
	className = '',
	selectClassName = '',
	children,
	...props
}) {
	const autoId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

	return (
		<div className={cn('space-y-1', className)}>
			<div className="relative">
				<select
					id={autoId}
					className={cn(
						'w-full appearance-none rounded-2xl border bg-white/70 backdrop-blur-md px-4 py-3 text-sm',
						'border-soft text-charcoal',
						'focus:outline-none focus:ring-2 focus:ring-trail/35 focus:border-trail/40',
						'dark:bg-white/5 dark:border-white/10 dark:text-sand',
						error
							? 'border-red-400/70 focus:ring-red-400/25 focus:border-red-400/60'
							: '',
						selectClassName
					)}
					{...props}
				>
					{children}
				</select>
				<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/60 dark:text-sand/60">
					▾
				</div>
				{!!label && (
					<label
						htmlFor={autoId}
						className="mb-1 block text-xs font-semibold text-charcoal/70 dark:text-sand/70"
					>
						{label}
					</label>
				)}
			</div>
			{!!error && <div className="text-xs text-red-600 dark:text-red-300">{error}</div>}
		</div>
	);
}
