import { cn } from '../../utils/cn';

export default function Textarea({
	label,
	id,
	error,
	className = '',
	textareaClassName = '',
	...props
}) {
	const autoId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

	return (
		<div className={cn('space-y-1', className)}>
			<div className="relative">
				<textarea
					id={autoId}
					placeholder=" "
					className={cn(
						'peer',
						'w-full min-h-32 resize-y rounded-2xl border bg-card px-4 pb-3 pt-5 text-sm',
						'border-border text-charcoal placeholder:text-transparent',
						'focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-charcoal/20',
						error
							? 'border-red-400/70 focus:ring-red-400/25 focus:border-red-400/60'
							: '',
						textareaClassName
					)}
					{...props}
				/>
				{!!label && (
					<label
						htmlFor={autoId}
						className={cn(
							'pointer-events-none absolute left-4 top-3 origin-left text-xs font-medium',
							'text-muted',
							'transition-[top,font-size,color] duration-200 ease-standard',
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
