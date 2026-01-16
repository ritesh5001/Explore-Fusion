import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export default function GlassNavbarContainer({ children, className = '', ...props }) {
	return (
		<motion.div
			className={cn(
				'rounded-2xl',
				'bg-[rgba(255,255,255,0.35)]',
				'backdrop-blur-[12px]',
				'border border-[rgba(255,255,255,0.4)]',
				'shadow-[0_12px_28px_rgba(0,0,0,0.06)]',
				className
			)}
			{...props}
		>
			{children}
		</motion.div>
	);
}
