export default function StatCard({ title, value, subtext }) {
	return (
		<div className="bg-sand border border-soft rounded-2xl p-6 shadow-sm transition transform hover:-translate-y-1">
			<div className="text-sm font-semibold text-gray-700">{title}</div>
			<div className="mt-2 text-3xl font-heading font-extrabold tracking-tight text-mountain">{value ?? '—'}</div>
			{!!subtext && <div className="mt-2 text-sm text-gray-500">{subtext}</div>}
		</div>
	);
}
