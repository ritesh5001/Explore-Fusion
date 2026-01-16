import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function GlassNavbarContainer({ children, className = '', ...props }) {
	return (
		<MotionDiv
				className={cn(
					'rounded-2xl',
					'bg-[rgba(255,255,255,0.28)]',
					'backdrop-blur-[8px]',
					'border border-[rgba(255,255,255,0.32)]',
					'shadow-[0_6px_12px_rgba(0,0,0,0.04)]',
					className
				)}
			{...props}
		>
			{children}
		</MotionDiv>
	);
}
