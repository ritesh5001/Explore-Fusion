import Card from '../ui/Card';

export default function StatCard({ title, value, subtext }) {
	return (
		<Card className="p-6 transition-transform hover:-translate-y-1">
			<div className="text-sm font-semibold text-charcoal/70 dark:text-sand/70">{title}</div>
			<div className="mt-2 text-3xl font-heading font-extrabold tracking-tight text-mountain dark:text-sand">{value ?? '—'}</div>
			{!!subtext && <div className="mt-2 text-sm text-charcoal/60 dark:text-sand/60">{subtext}</div>}
		</Card>
	);
}
