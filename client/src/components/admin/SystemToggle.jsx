export default function SystemToggle({
	label,
	description,
	enabled,
	onChange,
	disabled,
}) {
	return (
		<div className="bg-white border rounded-xl p-5 flex items-start justify-between gap-4">
			<div>
				<div className="font-bold text-gray-900">{label}</div>
				{!!description && <div className="text-sm text-gray-600 mt-1">{description}</div>}
			</div>

			<button
				type="button"
				disabled={disabled}
				onClick={() => onChange?.(!enabled)}
				className={
					`relative inline-flex h-7 w-12 items-center rounded-full transition ` +
					(enabled ? 'bg-forest' : 'bg-gray-300') +
					(disabled ? ' opacity-60 cursor-not-allowed' : ' cursor-pointer')
				}
				aria-pressed={enabled ? 'true' : 'false'}
				aria-label={label}
			>
				<span
					className={
						`inline-block h-5 w-5 transform rounded-full bg-white transition ` +
						(enabled ? 'translate-x-6' : 'translate-x-1')
					}
				/>
			</button>
		</div>
	);
}
