export default function SystemToggle({
	label,
	description,
	enabled,
	onChange,
	disabled,
}) {
	return (
		<div className="glass-card px-5 py-4 flex items-start justify-between gap-4">
			<div>
				<div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">{label}</div>
				{!!description && <div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1">{description}</div>}
			</div>

			<button
				type="button"
				disabled={disabled}
				onClick={() => onChange?.(!enabled)}
				className={
					`relative inline-flex h-7 w-12 items-center rounded-full transition border ` +
					(enabled ? 'bg-trail/40 border-trail/40' : 'bg-white/10 border-white/10') +
					(disabled ? ' opacity-60 cursor-not-allowed' : ' cursor-pointer')
				}
				aria-pressed={enabled ? 'true' : 'false'}
				aria-label={label}
			>
				<span
					className={
						`inline-block h-5 w-5 transform rounded-full bg-white transition shadow-sm ` +
						(enabled ? 'translate-x-6' : 'translate-x-1')
					}
				/>
			</button>
		</div>
	);
}
