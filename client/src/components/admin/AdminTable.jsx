import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import PageLoader from '../states/PageLoader';
import ErrorState from '../states/ErrorState';
import EmptyState from '../states/EmptyState';

export default function AdminTable({ title, subtitle, columns, loading, error, emptyText, children, right, onRetry, mobileCards }) {
	return (
		<Card className="overflow-hidden">
			<div className="px-5 py-4 border-b border-soft">
				<SectionHeader title={title} subtitle={subtitle} right={right} />
			</div>

			{loading ? (
				<PageLoader className="min-h-[220px]" label="Loading…" />
			) : error ? (
				<ErrorState className="m-5" title="Something went wrong" description={error} onRetry={onRetry} />
			) : children ? (
				<div>
					{!!mobileCards && <div className="p-4 md:hidden">{mobileCards}</div>}
					<div className={`${mobileCards ? 'hidden md:block' : ''} overflow-x-auto`}>
						<table className="min-w-full text-sm">
							<thead className="bg-sand dark:bg-white/5">
								<tr>
									{(columns || []).map((c) => (
										<th key={c} className="text-left font-semibold text-gray-700 dark:text-white/70 px-5 py-3 whitespace-nowrap">
											{c}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-soft">{children}</tbody>
						</table>
					</div>
				</div>
			) : (
				<div className="p-5">
					<EmptyState title="No records found" description={emptyText || 'No records found.'} />
				</div>
			)}
		</Card>
	);
}
