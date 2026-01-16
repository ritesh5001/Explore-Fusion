import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage';
import Button from '../ui/Button';
import { followUser, unfollowUser } from '../../api/follow';
import useAuth from '../../auth/useAuth';
import { useToast } from '../ToastProvider';
import { useReveal } from '../../hooks/useReveal';
import { hoverLuxury } from '../../theme/variants';

const getId = (u) => u?._id || u?.id || u?.userId;

export default function BuddyProfileCard({ user, revealDelayMs = 0 }) {
	const cardRevealRef = useReveal();
	const followRevealRef = useReveal();
	const { user: me } = useAuth();
	const { showToast } = useToast();
	const id = getId(user) ? String(getId(user)) : '';
	const name = user?.name || user?.fullName || user?.username || 'Traveler';
	const username = user?.username ? String(user.username) : '';
	const handle = username ? `@${username}` : name;
	const bio = user?.bio || user?.travelStyle || '';

	const isSelf = useMemo(() => {
		if (!me?._id || !id) return false;
		return String(me._id) === String(id);
	}, [me?._id, id]);

	const [isFollowing, setIsFollowing] = useState(Boolean(user?.isFollowing));
	const [loading, setLoading] = useState(false);

	const toggleFollow = async () => {
		if (!id) return;
		if (isSelf) return;
		if (loading) return;
		setLoading(true);

		// optimistic
		const next = !isFollowing;
		setIsFollowing(next);
		try {
			if (next) {
				await followUser(id);
				showToast(`Followed ${handle}`, 'success');
			} else {
				await unfollowUser(id);
				showToast(`Unfollowed ${handle}`, 'success');
			}
		} catch (e) {
			setIsFollowing((v) => !v);
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to update follow';
			showToast(msg, 'error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<article
			ref={cardRevealRef}
			data-reveal
			style={{ ['--reveal-delay']: `${Math.max(0, Number(revealDelayMs) || 0)}ms` }}
			className="w-[72vw] sm:w-[360px] lg:w-[380px]"
		>
			<motion.div
				{...hoverLuxury}
				className="rounded-[26px] border border-border bg-card overflow-hidden p-6 shadow-[0_18px_48px_rgba(0,0,0,0.06)]"
			>
				<div className="flex items-start justify-between gap-4">
					<Link to={id ? `/users/${id}` : '#'} className="flex items-start gap-3 min-w-0" aria-label={`View profile: ${handle}`}>
						<div className="h-16 w-16 rounded-full overflow-hidden border border-border bg-paper shrink-0">
							<SafeImage
								src={user?.avatar || ''}
								alt={handle}
								fallback="/avatar-placeholder.png"
								className="h-full w-full object-cover"
							/>
						</div>
						<div className="min-w-0">
							<div className="text-[15px] font-medium text-charcoal truncate">{name}</div>
							<div className="text-xs tracking-[0.12em] text-muted truncate">{username ? `@${username}` : 'Travel Buddy'}</div>
						</div>
					</Link>

					{me ? (
						<div
							ref={followRevealRef}
							data-reveal
							style={{
								['--reveal-delay']: `${Math.max(0, (Number(revealDelayMs) || 0) + 100)}ms`,
							}}
						>
							<Button
								onClick={toggleFollow}
								disabled={loading || isSelf || !id}
								variant="outline"
								size="sm"
								className={isFollowing ? 'bg-paper' : ''}
							>
								{loading ? '…' : isSelf ? 'You' : isFollowing ? 'Following' : 'Follow'}
							</Button>
						</div>
					) : null}
				</div>

				{bio ? (
					<p className="mt-4 text-sm leading-relaxed text-muted line-clamp-3">{bio}</p>
				) : (
					<p className="mt-4 text-sm leading-relaxed text-muted">Travel style, calmly shared.</p>
				)}

				<div className="mt-5 text-[11px] tracking-[0.18em] uppercase text-muted">
					Suggested companion
				</div>
			</motion.div>
		</article>
	);
}
