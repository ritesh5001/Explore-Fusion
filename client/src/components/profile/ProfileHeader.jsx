import SafeImage from '../common/SafeImage';

export default function ProfileHeader({ user }) {
	const name = user?.name || '';
	const username = user?.username ? String(user.username) : '';
	const bio = user?.bio ? String(user.bio) : '';

	return (
		<div className="flex items-start gap-4">
			<div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border border-soft dark:border-white/10 bg-soft/60 dark:bg-white/10 shrink-0">
				<SafeImage
					src={user?.avatar || ''}
					alt={name || username || 'User avatar'}
					fallback="/avatar-placeholder.png"
					className="h-full w-full object-cover"
					loading="eager"
				/>
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2 flex-wrap">
					<div className="text-2xl font-heading font-extrabold tracking-tight text-mountain dark:text-sand truncate">
						{name || username || 'Unknown user'}
					</div>
					{username ? (
						<div className="text-sm font-semibold text-charcoal/60 dark:text-sand/60">@{username}</div>
					) : null}
				</div>

				{!!bio && (
					<div className="mt-2 text-sm text-charcoal/80 dark:text-sand/80 leading-relaxed whitespace-pre-wrap">
						{bio}
					</div>
				)}
			</div>
		</div>
	);
}
