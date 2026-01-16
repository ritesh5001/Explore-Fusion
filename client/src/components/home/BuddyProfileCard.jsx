import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage';
import Button from '../ui/Button';
import { followUser, unfollowUser } from '../../api/follow';
import useAuth from '../../auth/useAuth';
import { useToast } from '../ToastProvider';

const getId = (u) => u?._id || u?.id || u?.userId;

export default function BuddyProfileCard({ user }) {
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
		<article className="w-[72vw] sm:w-[360px] lg:w-[380px]">
			<div className="rounded-[26px] border border-soft/80 bg-white/55 overflow-hidden p-5">
				<div className="flex items-start justify-between gap-4">
					<Link to={id ? `/users/${id}` : '#'} className="flex items-start gap-3 min-w-0" aria-label={`View profile: ${handle}`}>
						<div className="h-12 w-12 rounded-full overflow-hidden border border-soft/70 bg-soft/40 shrink-0">
							<SafeImage
								src={user?.avatar || ''}
								alt={handle}
								fallback="/avatar-placeholder.png"
								className="h-full w-full object-cover"
							/>
						</div>
						<div className="min-w-0">
							<div className="text-sm text-charcoal/90 truncate">{name}</div>
							<div className="text-xs tracking-wide text-charcoal/55 truncate">{username ? `@${username}` : 'Travel Buddy'}</div>
						</div>
					</Link>

					{me ? (
						<Button
							onClick={toggleFollow}
							disabled={loading || isSelf || !id}
							variant={isFollowing ? 'outline' : 'primary'}
							size="sm"
						>
							{loading ? '…' : isSelf ? 'You' : isFollowing ? 'Following' : 'Follow'}
						</Button>
					) : null}
				</div>

				{bio ? (
					<p className="mt-4 text-sm leading-relaxed text-charcoal/70 line-clamp-3">{bio}</p>
				) : (
					<p className="mt-4 text-sm leading-relaxed text-charcoal/50">Quiet traveler. Minimal details.</p>
				)}

				<div className="mt-5 text-[11px] tracking-[0.18em] uppercase text-charcoal/45">
					Suggested companion
				</div>
			</div>
		</article>
	);
}
