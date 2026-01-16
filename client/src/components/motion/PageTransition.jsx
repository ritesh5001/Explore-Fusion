import { motion } from 'framer-motion';
import { motionDuration, motionEasing } from '../../theme/motion';

const MotionDiv = motion.div;

export default function PageTransition({ children, className = '' }) {
	return (
		<MotionDiv
			className={className}
			initial={{ opacity: 0, y: 12 }}
			animate={{
				opacity: 1,
				y: 0,
				transition: {
					duration: motionDuration.lg / 1000,
					ease: motionEasing.softOut,
				},
			}}
			exit={{
				opacity: 0,
				y: -8,
				transition: {
					duration: motionDuration.md / 1000,
					ease: motionEasing.softOut,
				},
			}}
		>
			{children}
		</MotionDiv>
	);
}
