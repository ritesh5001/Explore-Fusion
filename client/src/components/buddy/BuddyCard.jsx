export default function BuddyCard({ user, actions }) {
	if (!user) return null;
	const id = user?._id || user?.id;
	const name = user?.name || user?.fullName || user?.username || user?.email || 'Traveler';
	const location = user?.location;
	const interests = Array.isArray(user?.interests) ? user.interests : null;

	return (
		<div className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4">
			<div className="min-w-0">
				<div className="font-semibold text-gray-900 truncate">{name}</div>
				{!!location && <div className="text-sm text-gray-600 mt-1">{location}</div>}
				{!!interests?.length && (
					<div className="text-sm text-gray-600 mt-1 truncate">Interests: {interests.join(', ')}</div>
				)}
				{!!id && <div className="text-xs text-gray-500 mt-2">User ID: {id}</div>}
			</div>
			{!!actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
		</div>
	);
}
