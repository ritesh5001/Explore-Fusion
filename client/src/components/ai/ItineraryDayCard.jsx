import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { fadeLiftFast } from '../../theme/variants';

const MotionDiv = motion.div;

export default function ItineraryDayCard({ day, plan }) {
	return (
		<div className="relative pl-10">
			<div className="absolute left-3 top-6 w-3 h-3 rounded-full bg-trail shadow-[0_0_0_6px_rgba(56,189,248,0.14)]" />
			<MotionDiv variants={fadeLiftFast} initial="hidden" animate="show">
				<Card className="p-5">
					<div className="flex items-center gap-2">
						<Badge tone="accent">Day {day}</Badge>
					</div>
					<div className="mt-3 text-sm text-charcoal/80 dark:text-sand/80 whitespace-pre-wrap break-words leading-relaxed">
						{plan}
					</div>
				</Card>
			</MotionDiv>
		</div>
	);
}
