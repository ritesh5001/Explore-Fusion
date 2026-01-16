import { motion } from 'framer-motion';
import { fadeLiftFast } from '../../theme/variants';

const MotionDiv = motion.div;

export default function ChatBubble({ role, text, time }) {
	const isUser = role === 'user';
	return (
		<MotionDiv
			variants={fadeLiftFast}
			initial="hidden"
			animate="show"
			className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
		>
			<div
				className={
					`max-w-[85%] rounded-2xl px-4 py-3 border backdrop-blur-md ` +
					(isUser
						? 'bg-forest text-white border-olive/60 dark:border-trail/20'
						: 'bg-white/70 dark:bg-white/5 text-charcoal dark:text-sand border-soft/80 dark:border-white/10')
				}
			>
				<div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</div>
				{!!time && (
					<div
						className={`mt-2 text-[11px] text-right ${
							isUser ? 'text-white/80' : 'text-charcoal/50 dark:text-sand/50'
						}`}
					>
						{time}
					</div>
				)}
			</div>
		</MotionDiv>
	);
}
