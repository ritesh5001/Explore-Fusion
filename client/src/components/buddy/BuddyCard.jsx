import { Link } from 'react-router-dom';
import Card from '../ui/Card';

export default function BuddyCard({ user, actions }) {
	if (!user) return null;
	const id = user?._id || user?.id;
	const name = user?.name || user?.fullName || user?.username || user?.email || 'Traveler';
	const location = user?.location;
	const interests = Array.isArray(user?.interests) ? user.interests : null;

	return (
		<Card className="p-4 flex items-start justify-between gap-4">
			<div className="min-w-0">
				{ id ? (
					<Link
						to={`/users/${id}`}
						className="font-semibold text-charcoal dark:text-sand truncate cursor-pointer hover:underline hover:text-adventure dark:hover:text-adventure transition-colors"
					>
						{name}
					</Link>
				) : (
					<div className="font-semibold text-charcoal dark:text-sand truncate">{name}</div>
				)}
				{!!location && <div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1">{location}</div>}
				{!!interests?.length && (
					<div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1 truncate">Interests: {interests.join(', ')}</div>
				)}
				{!!id && <div className="text-xs text-charcoal/50 dark:text-sand/50 mt-2">User ID: {id}</div>}
			</div>
			{!!actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
		</Card>
	);
}
