import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function ProfileActions({
	isOwnProfile,
	canFollow,
	isFollowing,
	followsYou,
	loading,
	onToggleFollow,
}) {
	return (
		<div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
			<div className="flex items-center gap-2 flex-wrap">
				{followsYou ? (
					<span className="text-xs px-2 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-soft dark:border-white/10 text-charcoal/80 dark:text-sand/80">
						Follows you
					</span>
				) : null}
				{isFollowing ? (
					<span className="text-xs px-2 py-1 rounded-full bg-trail/15 border border-trail/25 text-mountain dark:text-sand">
						You follow this user
					</span>
				) : null}
			</div>

			<div className="flex items-center gap-2">
				{isOwnProfile ? (
					<Button as={Link} to="/profile" variant="outline" size="sm">
						Edit profile
					</Button>
				) : canFollow ? (
					<Button
						onClick={onToggleFollow}
						disabled={loading}
						variant={isFollowing ? 'outline' : 'primary'}
						size="sm"
					>
						{loading ? 'Loading…' : isFollowing ? 'Unfollow' : 'Follow'}
					</Button>
				) : null}
			</div>
		</div>
	);
}
