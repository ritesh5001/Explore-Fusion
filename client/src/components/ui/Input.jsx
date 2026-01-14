import { cn } from '../../utils/cn';

export default function Input({
	label,
	id,
	error,
	className = '',
	inputClassName = '',
	...props
}) {
	const autoId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

	return (
		<div className={cn('space-y-1', className)}>
			<div className="relative">
				<input
					id={autoId}
					placeholder=" "
					className={cn(
						'peer',
						'w-full rounded-2xl border bg-white/70 backdrop-blur-md px-4 pb-3 pt-5 text-sm',
						'border-soft text-charcoal placeholder:text-transparent',
						'focus:outline-none focus:ring-2 focus:ring-trail/35 focus:border-trail/40',
						'dark:bg-white/5 dark:border-white/10 dark:text-sand',
						error
							? 'border-red-400/70 focus:ring-red-400/25 focus:border-red-400/60'
							: '',
						inputClassName
					)}
					{...props}
				/>
				{!!label && (
					<label
						htmlFor={autoId}
						className={cn(
							'pointer-events-none absolute left-4 top-3 origin-left text-xs font-semibold',
							'text-charcoal/60 dark:text-sand/60',
							'transition-all',
							'peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium',
							'peer-focus:top-3 peer-focus:text-xs peer-focus:font-semibold'
						)}
					>
						{label}
					</label>
				)}
			</div>
			{!!error && <div className="text-xs text-red-600 dark:text-red-300">{error}</div>}
		</div>
	);
}
