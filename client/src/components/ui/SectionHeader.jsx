export default function SectionHeader({ title, subtitle, right }) {
	return (
		<div className="flex items-start justify-between gap-4">
			<div>
				<h1 className="section-title">{title}</h1>
				{!!subtitle && <div className="mt-1 text-sm text-gray-600 dark:text-white/70">{subtitle}</div>}
			</div>
			{right}
		</div>
	);
}
