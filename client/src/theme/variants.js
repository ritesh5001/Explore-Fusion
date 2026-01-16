import { motionDuration, motionEasing } from './motion';

export const fadeLift = {
	hidden: { opacity: 0, y: 8 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: motionDuration.md / 1000,
			ease: motionEasing.softOut,
		},
	},
};

export const hoverLuxury = {
	whileHover: {
		scale: 1.02,
		transition: {
			duration: motionDuration.sm / 1000,
			ease: motionEasing.standard,
		},
	},
};

export const glassShift = {
	rest: { backdropFilter: 'blur(10px)' },
	scrolled: {
		backdropFilter: 'blur(14px)',
		transition: {
			duration: motionDuration.md / 1000,
			ease: motionEasing.softOut,
		},
	},
};
