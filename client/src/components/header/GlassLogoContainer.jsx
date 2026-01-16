import { cn } from '../../utils/cn';

export default function GlassLogoContainer({ children, className = '' }) {
	return (
		<div
			className={cn(
				'rounded-2xl',
				'bg-[rgba(255,255,255,0.35)]',
				'backdrop-blur-[12px]',
				'border border-[rgba(255,255,255,0.4)]',
				'px-[22px] py-[10px]',
				'shadow-[0_12px_28px_rgba(0,0,0,0.06)]',
				className
			)}
		>
			{children}
		</div>
	);
}
