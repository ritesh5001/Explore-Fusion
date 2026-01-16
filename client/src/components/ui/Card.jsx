import { cn } from '../../utils/cn';

export default function Card({ className = '', children }) {
	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-2xl border',
				'bg-card border-border shadow-[0_18px_48px_rgba(0,0,0,0.06)]',
				className
			)}
		>
			{children}
		</div>
	);
}
