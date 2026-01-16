import { useEffect, useRef, useState, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionSvg = motion.svg;
const MotionPath = motion.path;

function getMenuButtonRect(ref) {
  if (!ref.current) return { left: 0, top: 0, width: 0, height: 0 };
  return ref.current.getBoundingClientRect();
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
	const [menuRect, setMenuRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
	const panelRef = useRef(null);

	// Get menu button position for anchoring
	useEffect(() => {
		if (!open) return;
		const updateRect = () => setMenuRect(getMenuButtonRect(menuButtonRef));
		updateRect();
		window.addEventListener('resize', updateRect);
		window.addEventListener('scroll', updateRect, true);
		return () => {
			window.removeEventListener('resize', updateRect);
			window.removeEventListener('scroll', updateRect, true);
		};
	}, [open, menuButtonRef]);

	// ESC closes
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e) => {
			if (e.key === 'Escape') onClose?.();
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [open, onClose]);

	// Click outside closes
	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (e) => {
			if (panelRef.current && !panelRef.current.contains(e.target) && !menuButtonRef.current.contains(e.target)) {
				onClose?.();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [open, onClose, menuButtonRef]);

	// Animation config
	const OPEN_EASE = [0.22, 1, 0.36, 1];
	const CLOSE_EASE = [0.4, 0, 1, 1];
	const OPEN_DURATION = 0.32;
	const CLOSE_DURATION = 0.24;
	const STAGGER = 0.06;

	// Panel position: below button, centered horizontally
	const [panelHeight, setPanelHeight] = useState(0);
	useEffect(() => {
		if (!open) return;
		if (!panelRef.current) return;
		const updateHeight = () => {
			setPanelHeight(panelRef.current.scrollHeight);
		};
		updateHeight();
		// Listen for resize/scroll in case content changes
		window.addEventListener('resize', updateHeight);
		return () => window.removeEventListener('resize', updateHeight);
	}, [open, links]);

	const panelStyle = useMemo(() => {
		const { left, top, width, height } = menuRect;
		return {
			position: 'absolute',
			left: left + width / 2 - 160, // 320px/2
			top: top + height + 8, // 8px below button, tight to navbar
			zIndex: 40,
			width: 320,
			maxWidth: '92vw',
			borderRadius: '1.25rem',
			boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
			background: 'rgba(246,243,239,0.96)',
			backdropFilter: 'blur(16px)',
			overflow: 'auto',
			maxHeight: '70vh',
			pointerEvents: open ? 'auto' : 'none',
			border: '1px solid rgba(30,30,30,0.07)',
		};
	}, [menuRect, open]);

	// Clip-path origin: center top of panel (matches button)
	const originX = menuRect.left + menuRect.width / 2 - (panelStyle.left ?? 0);
	const originY = 0;
	const minRadius = 120;
	const openRadius = Math.max(Math.min(panelHeight / 2 + 40, 320), minRadius);

	const panelVariants = {
		open: {
			opacity: 1,
			clipPath: `circle(${openRadius}px at ${originX}px ${originY}px)`,
			transition: { duration: 0.42, ease: OPEN_EASE },
		},
		closed: {
			opacity: 0,
			clipPath: `circle(24px at ${originX}px ${originY}px)`,
			transition: { duration: 0.32, ease: CLOSE_EASE },
		},
	};

	const menuVariants = {
		open: {
			transition: { staggerChildren: STAGGER, delayChildren: 0.10 },
		},
		closed: {
			transition: { staggerChildren: STAGGER, staggerDirection: -1 },
		},
	};

	const itemVariants = {
		open: { y: 0, opacity: 1, transition: { duration: 0.22, ease: OPEN_EASE } },
		closed: { y: 32, opacity: 0, transition: { duration: 0.16, ease: CLOSE_EASE } },
	};

	if (typeof window === 'undefined') return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<MotionDiv
					ref={panelRef}
					className="luxury-menu-panel"
					style={panelStyle}
					initial="closed"
					animate="open"
					exit="closed"
					variants={panelVariants}
				>
					<MotionDiv
						className="flex flex-col gap-0 py-2"
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
									className="block text-left px-5 py-1.5 leading-[1.4] font-medium text-[#1c1c1c]/90 hover:bg-black/5 transition rounded-xl"
									style={{ fontWeight: 500, fontSize: '1.08rem', marginBottom: '8px' }}
								>
									{l.label}
								</Link>
							</MotionDiv>
						))}
						<div className="h-px bg-black/10 my-2 mx-4" />
						{!isAuthenticated ? (
							<MotionDiv initial="closed" animate="open" exit="closed" variants={itemVariants} className="grid grid-cols-2 gap-2 px-4 pb-2">
								<Button as={Link} to="/login" variant="secondary" size="sm" className="w-full" onClick={onClose}>
									Sign in
								</Button>
								<Button as={Link} to="/register" size="sm" className="w-full" onClick={onClose}>
									Register
								</Button>
							</MotionDiv>
						) : (
							<MotionDiv initial="closed" animate="open" exit="closed" variants={itemVariants} className="flex items-center justify-between gap-3 px-6 pb-2">
								<span className="text-[#1c1c1c] font-medium truncate">{userName || 'User'}</span>
								<Button variant="danger" size="sm" onClick={onLogout}>
									Logout
								</Button>
							</MotionDiv>
						)}
					</MotionDiv>
				</MotionDiv>
			)}
		</AnimatePresence>,
		document.body
	);
}
