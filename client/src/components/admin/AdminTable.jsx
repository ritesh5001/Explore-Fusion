import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import PageLoader from '../ui/PageLoader';
import ErrorState from '../ui/ErrorState';
import EmptyState from '../ui/EmptyState';

export default function AdminTable({ title, subtitle, columns, loading, error, emptyText, children, right, onRetry, mobileCards }) {
	return (
		<Card className="overflow-hidden">
			<div className="px-5 py-4 border-b border-soft/80 dark:border-white/10">
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
							<thead className="bg-sand/80 dark:bg-white/5">
								<tr>
									{(columns || []).map((c) => (
										<th key={c} className="text-left font-semibold text-charcoal/70 dark:text-sand/70 px-5 py-3 whitespace-nowrap">
											{c}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-soft/80 dark:divide-white/10">{children}</tbody>
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
