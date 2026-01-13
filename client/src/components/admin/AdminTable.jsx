export default function AdminTable({ title, subtitle, columns, loading, error, emptyText, children, right }) {
	return (
		<div className="glass-card overflow-hidden shadow-sm">
			<div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-soft">
				<div>
					<div className="text-lg font-heading font-extrabold tracking-tight text-mountain">{title}</div>
					{!!subtitle && <div className="text-sm text-gray-600 mt-1">{subtitle}</div>}
				</div>
				{right}
			</div>

			{loading ? (
				<div className="p-6 text-gray-700">Loading…</div>
			) : error ? (
				<div className="p-6">
					<div className="text-red-600 font-semibold">Error</div>
					<div className="text-gray-700 text-sm mt-1">{error}</div>
				</div>
			) : children ? (
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-sand">
							<tr>
								{(columns || []).map((c) => (
									<th key={c} className="text-left font-semibold text-gray-700 px-5 py-3 whitespace-nowrap">
										{c}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y">{children}</tbody>
					</table>
				</div>
			) : (
				<div className="p-6 text-gray-600">{emptyText || 'No records.'}</div>
			)}
		</div>
	);
}
