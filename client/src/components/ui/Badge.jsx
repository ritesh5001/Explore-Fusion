import { cn } from '../../utils/cn';

const tones = {
	default: 'bg-soft/70 text-charcoal/80 dark:bg-white/10 dark:text-sand/80',
	accent: 'bg-trail/15 text-trail dark:bg-trail/15 dark:text-trail',
	gold: 'bg-gold/15 text-gold dark:bg-gold/15 dark:text-gold',
	success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
	danger: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export default function Badge({ children, tone = 'default', className = '' }) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
				'border border-black/5 dark:border-white/10',
				tones[tone] || tones.default,
				className
			)}
		>
			{children}
		</span>
	);
}
