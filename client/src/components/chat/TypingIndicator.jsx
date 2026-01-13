export default function TypingIndicator({ user }) {
	if (!user) return null;
	return <div className="text-sm text-gray-500 px-1">{user} is typing…</div>;
}
