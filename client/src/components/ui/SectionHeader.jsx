export default function SectionHeader({ title, subtitle, right, action }) {
	const slot = right ?? action;
	return (
		<div className="flex items-start justify-between gap-4">
			<div>
				<h1 className="section-title">{title}</h1>
				{!!subtitle && <div className="mt-1 text-sm text-charcoal/70 dark:text-sand/70 max-w-3xl">{subtitle}</div>}
			</div>
			{slot}
		</div>
	);
}
