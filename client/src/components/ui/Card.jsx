import { cn } from '../../utils/cn';

export default function Card({ className = '', children }) {
	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-2xl border backdrop-blur-md',
				'bg-white/70 border-soft/80 shadow-sm',
				'dark:bg-white/5 dark:border-white/10',
				'dark:shadow-[0_12px_50px_rgba(0,0,0,0.35)]',
				// subtle premium glow
				'dark:before:absolute dark:before:inset-0 dark:before:pointer-events-none',
				'dark:before:bg-[radial-gradient(600px_240px_at_20%_0%,rgba(34,211,238,0.10),transparent_60%)]',
				className
			)}
		>
			{children}
		</div>
	);
}
