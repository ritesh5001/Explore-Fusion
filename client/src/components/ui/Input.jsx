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
						'w-full rounded-2xl border bg-card px-4 pb-3 pt-5 text-sm',
						'border-border text-charcoal placeholder:text-transparent',
						'focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-charcoal/20',
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
							'pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium',
							'text-muted',
							'transition-all',
							'peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium',
							'peer-focus:top-3 peer-focus:text-xs peer-focus:font-medium'
						)}
					>
						{label}
					</label>
				)}
			</div>
			{!!error && <div className="text-xs text-red-600">{error}</div>}
		</div>
	);
}
