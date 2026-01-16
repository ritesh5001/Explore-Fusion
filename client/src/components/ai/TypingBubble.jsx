import { motion } from 'framer-motion';
import { motionDuration, motionEasing } from '../../theme/motion';
import { fadeLiftFast } from '../../theme/variants';

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const Dot = ({ delayMs }) => (
	<MotionSpan
		className="inline-block h-2 w-2 rounded-full bg-charcoal/50 dark:bg-sand/60"
		initial={{ opacity: 0.35 }}
		animate={{ opacity: [0.35, 1, 0.35] }}
		transition={{
			duration: motionDuration.xl / 1000,
			ease: motionEasing.standard,
			repeat: Infinity,
			delay: (Number(delayMs) || 0) / 1000,
		}}
	/>
);

export default function TypingBubble() {
	return (
		<MotionDiv variants={fadeLiftFast} initial="hidden" animate="show" className="flex justify-start">
			<div className="max-w-[85%] rounded-2xl px-4 py-3 border backdrop-blur-md bg-white/70 dark:bg-white/5 text-charcoal dark:text-sand border-soft/80 dark:border-white/10">
				<div className="flex items-center gap-2" aria-label="AI is typing">
					<Dot delayMs={0} />
					<Dot delayMs={150} />
					<Dot delayMs={300} />
					<span className="ml-2 text-sm text-charcoal/60 dark:text-sand/60">Thinking…</span>
				</div>
			</div>
		</MotionDiv>
	);
}
