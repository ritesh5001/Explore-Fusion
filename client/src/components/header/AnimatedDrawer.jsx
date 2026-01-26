import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as motion from 'motion/react-client';
import { AnimatePresence, stagger, useReducedMotion } from 'motion/react';
import Button from '../ui/Button';
import { motionDuration, motionEasing } from '../../theme/motion';

const MotionAside = motion.aside;
const MotionButton = motion.button;
const MotionDiv = motion.div;
const MotionPath = motion.path;
const MotionSvg = motion.svg;

const overlayVariants = {
	open: {
		opacity: 1,
		transition: { duration: motionDuration.xs / 1000, ease: motionEasing.standard },
	},
	closed: {
		opacity: 0,
		transition: { duration: motionDuration.xs / 1000, ease: motionEasing.standard },
	},
};

const makeSidebarVariants = ({ reduceMotion }) => {
	if (reduceMotion) {
		return {
			open: {
				opacity: 1,
				transform: 'translateX(0px)',
				transition: { duration: motionDuration.sm / 1000, ease: motionEasing.softOut },
			},
			closed: {
				opacity: 0,
				transform: 'translateX(-10px)',
				transition: { duration: motionDuration.xs / 1000, ease: motionEasing.standard },
			},
		};
	}

	// Circle expands from the top-left near the menu button.
	return {
		open: {
			opacity: 1,
			clipPath: 'circle(140% at 40px 44px)',
			transition: { duration: motionDuration.lg / 1000, ease: motionEasing.softOut },
		},
		closed: {
			opacity: 0,
			clipPath: 'circle(20px at 40px 44px)',
			transition: { duration: motionDuration.md / 1000, ease: motionEasing.standard },
		},
	};
};

const itemVariants = {
	open: ({ index, total, reduceMotion }) => {
		const baseDelay = reduceMotion ? 0 : stagger(0.055, { startDelay: 0.12 })(index, total);
		return {
			opacity: 1,
			y: 0,
			transition: {
				duration: motionDuration.sm / 1000,
				ease: motionEasing.softOut,
				delay: baseDelay,
			},
		};
	},
	closed: ({ reduceMotion }) => ({
		opacity: 0,
		y: reduceMotion ? 0 : 12,
		transition: { duration: motionDuration.xs / 1000, ease: motionEasing.standard },
	}),
};

export function DrawerToggleIcon({ open }) {
	// Subtle, luxury-feeling morph; no bounce.
	const transition = useMemo(
		() => ({ duration: motionDuration.sm / 1000, ease: motionEasing.softOut }),
		[]
	);
	const topPath = open ? 'M 4 4 L 16 16' : 'M 3 6 L 17 6';
	const middlePath = 'M 3 10 L 17 10';
	const bottomPath = open ? 'M 16 4 L 4 16' : 'M 3 14 L 17 14';

	return (
		<MotionSvg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
			<MotionPath
				fill="transparent"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				d={topPath}
				initial={{ d: topPath }}
				animate={{ d: topPath }}
				transition={transition}
			/>
			<MotionPath
				fill="transparent"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				d={middlePath}
				initial={{ d: middlePath }}
				animate={{ opacity: open ? 0 : 1 }}
				transition={transition}
			/>
			<MotionPath
				fill="transparent"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				d={bottomPath}
				initial={{ d: bottomPath }}
				animate={{ d: bottomPath }}
				transition={transition}
			/>
		</MotionSvg>
	);
}

export default function AnimatedDrawer({
	open,
	onClose,
	links,
	isAuthenticated,
	userName,
	onLogout,
}) {
	const reduceMotion = useReducedMotion();
	const sidebarVariants = useMemo(() => makeSidebarVariants({ reduceMotion }), [reduceMotion]);

	useEffect(() => {
		if (!open) return undefined;

		const html = document.documentElement;
		const body = document.body;
		const prevHtmlOverflow = html.style.overflow;
		const prevBodyOverflow = body.style.overflow;

		html.style.overflow = 'hidden';
		body.style.overflow = 'hidden';

		const onKeyDown = (e) => {
			if (e.key === 'Escape') onClose?.();
		};
		window.addEventListener('keydown', onKeyDown);

		return () => {
			html.style.overflow = prevHtmlOverflow;
			body.style.overflow = prevBodyOverflow;
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [open, onClose]);

	const totalItems = (links?.length || 0) + (isAuthenticated ? 1 : 2);

	return (
		<AnimatePresence>
			{open && (
				<>
					<MotionButton
						type="button"
						aria-label="Close menu"
						className="fixed inset-0 z-40 bg-black/15"
						initial="closed"
						animate="open"
						exit="closed"
						variants={overlayVariants}
						onClick={onClose}
					/>

					<MotionAside
						className="fixed top-0 left-0 z-50 h-dvh w-[86vw] max-w-sm border-r border-black/10 bg-[#f6f3ef]/95 backdrop-blur-xl"
						role="dialog"
						aria-modal="true"
						aria-label="Navigation menu"
						initial="closed"
						animate="open"
						exit="closed"
						variants={sidebarVariants}
						style={{ willChange: reduceMotion ? undefined : 'clip-path' }}
					>
						<div className="p-4 flex items-center justify-between">
							<div className="min-w-0">
								<div className="font-heading font-medium tracking-[0.04em] text-[#1c1c1c]">Menu</div>
								{!!userName && (
									<div className="text-xs text-[#1c1c1c]/70 mt-1 truncate">{userName}</div>
								)}
							</div>
							<Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
								✕
							</Button>
						</div>

						<div className="px-4 pb-4">
							<div className="flex flex-col gap-1">
								{(links || []).map((l, index) => (
									<MotionDiv
										key={l.to}
										custom={{ index, total: totalItems, reduceMotion }}
										initial="closed"
										animate="open"
										exit="closed"
										variants={itemVariants}
									>
										<Link
											to={l.to}
											onClick={onClose}
											className="rounded-2xl px-3 py-2 font-medium text-[#1c1c1c]/85 hover:bg-black/5 transition"
										>
											{l.label}
										</Link>
									</MotionDiv>
								))}
							</div>

							<div className="h-px bg-black/10 my-4" />

							{!isAuthenticated ? (
								<MotionDiv
									custom={{ index: (links?.length || 0) + 0, total: totalItems, reduceMotion }}
									initial="closed"
									animate="open"
									exit="closed"
									variants={itemVariants}
									className="grid grid-cols-2 gap-2"
								>
									<Button
										as={Link}
										to="/login"
										variant="secondary"
										size="sm"
										className="w-full"
										onClick={onClose}
									>
										Sign in
									</Button>
									<Button
										as={Link}
										to="/register"
										size="sm"
										className="w-full"
										onClick={onClose}
									>
										Register
									</Button>
								</MotionDiv>
							) : (
								<MotionDiv
									custom={{ index: (links?.length || 0) + 0, total: totalItems, reduceMotion }}
									initial="closed"
									animate="open"
									exit="closed"
									variants={itemVariants}
									className="flex items-center justify-between gap-3"
								>
									<span className="text-[#1c1c1c] font-medium truncate">{userName || 'User'}</span>
									<Button variant="danger" size="sm" onClick={onLogout}>
										Logout
									</Button>
								</MotionDiv>
							)}
						</div>
					</MotionAside>
				</>
			)}
		</AnimatePresence>
	);
}
