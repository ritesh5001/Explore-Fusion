export const easeOutSoft = [0.16, 1, 0.3, 1];

export const pageTransition = {
	initial: { opacity: 0, y: 8, filter: 'blur(6px)' },
	animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
	exit: { opacity: 0, y: -6, filter: 'blur(6px)' },
	transition: { duration: 0.28, ease: easeOutSoft },
};

export const fadeInUp = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.22, ease: easeOutSoft },
};

export const cardHover = {
	rest: { y: 0, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
	hover: { y: -6, boxShadow: '0 14px 44px rgba(0,0,0,0.22)' },
};
