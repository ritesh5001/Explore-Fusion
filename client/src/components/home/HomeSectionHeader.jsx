export default function HomeSectionHeader({ title, subtitle, right }) {
	return (
		<div className="flex items-end justify-between gap-6">
			<div className="min-w-0">
				<h2 className="text-[22px] sm:text-[26px] font-heading font-medium tracking-tight text-mountain">
					{title}
				</h2>
				{subtitle ? (
					<p className="mt-2 text-sm text-charcoal/65 max-w-2xl">{subtitle}</p>
				) : null}
			</div>
			{right ? <div className="shrink-0">{right}</div> : null}
		</div>
	);
}
