import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { motionDuration, motionEasing } from '../../theme/motion';

const MotionDiv = motion.div;
const MotionButton = motion.button;

export default function MobileMenuDrawer({
	open,
	onClose,
	links,
	isAuthenticated,
	userName,
	onLogout,
}) {
	return (
		<AnimatePresence>
			{open && (
				<>
					<MotionButton
						type="button"
						aria-label="Close menu"
						className="fixed inset-0 z-40 bg-black/15"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: motionDuration.xs / 1000, ease: motionEasing.standard }}
						onClick={onClose}
					/>

					<MotionDiv
						className="fixed top-0 left-0 z-50 h-dvh w-[86vw] max-w-sm border-r border-border bg-paper/92 backdrop-blur-xl"
						initial={{ x: -40, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -40, opacity: 0 }}
						transition={{ duration: motionDuration.md / 1000, ease: motionEasing.softOut }}
						role="dialog"
						aria-modal="true"
						aria-label="Navigation menu"
					>
						<div className="p-4 flex items-center justify-between">
							<div className="min-w-0">
								<div className="font-heading font-medium tracking-[0.04em] text-charcoal">Menu</div>
								{!!userName && <div className="text-xs text-muted mt-1 truncate">{userName}</div>}
							</div>
							<Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
								✕
							</Button>
						</div>

						<div className="px-4 pb-4">
							<div className="flex flex-col gap-1">
								{links.map((l) => (
									<Link
										key={l.to}
										to={l.to}
										onClick={onClose}
										className="rounded-2xl px-3 py-2 font-medium text-charcoal/85 hover:bg-black/5 transition"
									>
										{l.label}
									</Link>
								))}
							</div>

							<div className="h-px bg-border my-4" />

							{!isAuthenticated ? (
								<div className="grid grid-cols-2 gap-2">
									<Button as={Link} to="/login" variant="secondary" size="sm" className="w-full" onClick={onClose}>
										Sign in
									</Button>
									<Button as={Link} to="/register" size="sm" className="w-full" onClick={onClose}>
										Register
									</Button>
								</div>
							) : (
								<div className="flex items-center justify-between gap-3">
									<span className="text-charcoal font-medium truncate">{userName || 'User'}</span>
									<Button variant="danger" size="sm" onClick={onLogout}>
										Logout
									</Button>
								</div>
							)}
						</div>
					</MotionDiv>
				</>
			)}
		</AnimatePresence>
	);
}
