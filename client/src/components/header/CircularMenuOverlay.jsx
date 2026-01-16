import { useEffect, useRef, useState, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { AnimatePresence, stagger, useReducedMotion } from 'motion/react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionSvg = motion.svg;
const MotionPath = motion.path;

function getMenuButtonCoords(ref) {
	if (!ref.current) return { x: 40, y: 44 };
	const rect = ref.current.getBoundingClientRect();
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

export function CircularMenuToggleIcon({ open }) {
	const transition = useMemo(() => ({ type: 'spring', stiffness: open ? 20 : 400, damping: open ? 18 : 40 }), [open]);
	return (
		<MotionSvg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
			<MotionPath
				fill="transparent"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				animate={{ d: open ? 'M 4 4 L 16 16' : 'M 3 6 L 17 6' }}
				transition={transition}
			/>
			<MotionPath
				fill="transparent"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				animate={{ opacity: open ? 0 : 1 }}
				d="M 3 10 L 17 10"
				transition={transition}
			/>
			<MotionPath
				fill="transparent"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				animate={{ d: open ? 'M 16 4 L 4 16' : 'M 3 14 L 17 14' }}
				transition={transition}
			/>
		</MotionSvg>
	);
}

export default function CircularMenuOverlay({
	open,
	onClose,
	menuButtonRef,
	links,
	isAuthenticated,
	userName,
	onLogout,
}) {
	const reduceMotion = useReducedMotion();
	const [coords, setCoords] = useState({ x: 40, y: 44 });
	const overlayRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		setCoords(getMenuButtonCoords(menuButtonRef));
		const handleResize = () => setCoords(getMenuButtonCoords(menuButtonRef));
		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', handleResize, true);
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', handleResize, true);
		};
	}, [open, menuButtonRef]);

	useEffect(() => {
		if (!open) return;
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

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (e) => {
			if (overlayRef.current && !overlayRef.current.contains(e.target) && !menuButtonRef.current.contains(e.target)) {
				onClose?.();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [open, onClose, menuButtonRef]);

	const sidebarVariants = useMemo(() => {
		const x = coords.x;
		const y = coords.y;
		if (reduceMotion) {
			return {
				open: {
					opacity: 1,
					clipPath: `circle(1200px at ${x}px ${y}px)`,
					transition: { duration: 0.3 },
				},
				closed: {
					opacity: 0,
					clipPath: `circle(24px at ${x}px ${y}px)`,
					transition: { duration: 0.2 },
				},
			};
		}
		return {
			open: {
				opacity: 1,
				clipPath: `circle(1200px at ${x}px ${y}px)`,
				transition: { type: 'spring', stiffness: 20, damping: 18 },
			},
			closed: {
				opacity: 0,
				clipPath: `circle(24px at ${x}px ${y}px)`,
				transition: { type: 'spring', stiffness: 400, damping: 40 },
			},
		};
	}, [coords, reduceMotion]);

	const menuVariants = {
		open: {
			transition: { delayChildren: stagger(0.07, { startDelay: 0.2 }) },
		},
		closed: {
			transition: { delayChildren: stagger(0.05, { from: 'last' }) },
		},
	};

	const itemVariants = {
		open: { y: 0, opacity: 1 },
		closed: { y: 40, opacity: 0 },
	};

	// removed unused totalItems

	if (typeof window === 'undefined') return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<MotionDiv
					ref={overlayRef}
					className="fixed inset-0 z-[100] flex items-start justify-center"
					initial="closed"
					animate="open"
					exit="closed"
					variants={sidebarVariants}
					style={{ background: 'rgba(246,243,239,0.98)', backdropFilter: 'blur(16px)', willChange: 'clip-path' }}
				>
					<div className="mt-24 w-full max-w-sm mx-auto">
						<div className="flex items-center justify-between px-4 pb-2">
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
						<MotionDiv
							className="flex flex-col gap-2 px-4 pb-6"
							initial="closed"
							animate="open"
							exit="closed"
							variants={menuVariants}
						>
							{(links || []).map((l) => (
								<MotionDiv
									key={l.to}
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
							<div className="h-px bg-black/10 my-4" />
							{!isAuthenticated ? (
								<MotionDiv initial="closed" animate="open" exit="closed" variants={itemVariants} className="grid grid-cols-2 gap-2">
									<Button as={Link} to="/login" variant="secondary" size="sm" className="w-full" onClick={onClose}>
										Sign in
									</Button>
									<Button as={Link} to="/register" size="sm" className="w-full" onClick={onClose}>
										Register
									</Button>
								</MotionDiv>
							) : (
								<MotionDiv initial="closed" animate="open" exit="closed" variants={itemVariants} className="flex items-center justify-between gap-3">
									<span className="text-[#1c1c1c] font-medium truncate">{userName || 'User'}</span>
									<Button variant="danger" size="sm" onClick={onLogout}>
										Logout
									</Button>
								</MotionDiv>
							)}
						</MotionDiv>
					</div>
				</MotionDiv>
			)}
		</AnimatePresence>,
		document.body
	);
}
