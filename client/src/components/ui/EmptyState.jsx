import Card from './Card';
import Button from './Button';

export default function EmptyState({
	title = 'Nothing here yet',
	description = 'Try again in a moment, or adjust your filters.',
	actionLabel,
	onAction,
	icon = '🗂️',
	className = '',
}) {
	return (
		<Card className={`p-8 text-center ${className}`}>
			<div className="text-3xl">{icon}</div>
			<div className="mt-3 font-heading font-bold text-mountain dark:text-sand">{title}</div>
			{!!description && <div className="mt-1 text-sm text-charcoal/70 dark:text-sand/70">{description}</div>}
			{!!actionLabel && typeof onAction === 'function' && (
				<div className="mt-5 flex justify-center">
					<Button type="button" variant="outline" onClick={onAction} aria-label={actionLabel}>
						{actionLabel}
					</Button>
				</div>
			)}
		</Card>
	);
}
