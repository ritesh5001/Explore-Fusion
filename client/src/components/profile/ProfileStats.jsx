export default function ProfileStats({ followers = 0, following = 0, posts = 0 }) {
	const items = [
		{ label: 'Followers', value: followers },
		{ label: 'Following', value: following },
		{ label: 'Posts', value: posts },
	];

	return (
		<div className="mt-5 grid grid-cols-3 gap-3 text-center">
			{items.map((it) => (
				<div key={it.label} className="rounded-2xl border border-soft dark:border-white/10 p-4">
					<div className="text-xs text-charcoal/60 dark:text-sand/60">{it.label}</div>
					<div className="text-2xl font-bold text-mountain dark:text-sand">{Number(it.value || 0)}</div>
				</div>
			))}
		</div>
	);
}
