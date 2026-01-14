import Card from '../ui/Card';

export default function ReportCard({ title, value, hint }) {
	return (
		<Card className="p-6 transition-transform hover:-translate-y-1">
			<div className="text-xs font-bold text-charcoal/60 dark:text-sand/60 uppercase tracking-wide">{title}</div>
			<div className="mt-2 text-2xl font-heading font-extrabold tracking-tight text-mountain dark:text-sand break-words">
				{value ?? '—'}
			</div>
			{!!hint && <div className="mt-2 text-sm text-charcoal/70 dark:text-sand/70">{hint}</div>}
		</Card>
	);
}
