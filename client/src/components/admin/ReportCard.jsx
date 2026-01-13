export default function ReportCard({ title, value, hint }) {
	return (
		<div className="bg-sand border border-soft rounded-2xl p-6 shadow-sm transition transform hover:-translate-y-1">
			<div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</div>
			<div className="mt-2 text-2xl font-heading font-extrabold tracking-tight text-mountain break-words">{value ?? '—'}</div>
			{!!hint && <div className="mt-2 text-sm text-gray-600">{hint}</div>}
		</div>
	);
}
