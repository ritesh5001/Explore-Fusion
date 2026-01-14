import { cn } from '../../utils/cn';

export default function Skeleton({ className = '' }) {
	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-xl bg-soft/70 dark:bg-white/10',
				'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.2s_infinite]',
				'after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent dark:after:via-white/10',
				className
			)}
		/>
	);
}
