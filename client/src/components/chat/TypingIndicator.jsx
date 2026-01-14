export default function TypingIndicator({ user }) {
	if (!user) return null;
	return <div className="text-sm text-charcoal/60 dark:text-sand/60 px-1">{user} is typing…</div>;
}
