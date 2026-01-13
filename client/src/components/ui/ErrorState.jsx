import Card from './Card';
import Button from './Button';

export default function ErrorState({
	title = 'Something went wrong',
	description = 'Please try again.',
	onRetry,
	retryLabel = 'Retry',
	icon = '⚠️',
	className = '',
}) {
	return (
		<Card className={`p-8 ${className}`}>
			<div role="alert" className="text-center">
				<div className="text-3xl">{icon}</div>
				<div className="mt-3 font-heading font-bold text-mountain dark:text-sand">{title}</div>
				{!!description && <div className="mt-1 text-sm text-charcoal/70 dark:text-sand/70">{description}</div>}
				{typeof onRetry === 'function' && (
					<div className="mt-5 flex justify-center">
						<Button type="button" onClick={onRetry} aria-label={retryLabel}>
							{retryLabel}
						</Button>
					</div>
				)}
			</div>
		</Card>
	);
}
