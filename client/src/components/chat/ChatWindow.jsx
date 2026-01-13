import { useEffect, useMemo, useRef } from 'react';
import MessageBubble from './MessageBubble';

const normalizeAuthor = (v) => String(v || '').trim().toLowerCase();

const isMine = (messageAuthor, user) => {
	if (!user) return false;
	const a = normalizeAuthor(messageAuthor);
	return (
		a &&
		(
			a === normalizeAuthor(user?._id) ||
			a === normalizeAuthor(user?.id) ||
			a === normalizeAuthor(user?.email) ||
			a === normalizeAuthor(user?.name)
		)
	);
};

export default function ChatWindow({ messages, currentUser, loading }) {
	const endRef = useRef(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages?.length]);

	const safeMessages = useMemo(() => (Array.isArray(messages) ? messages : []), [messages]);

	if (loading) {
		return <div className="flex-1 overflow-y-auto p-4 text-gray-600">Loading messages…</div>;
	}

	if (!safeMessages.length) {
		return <div className="flex-1 overflow-y-auto p-4 text-gray-600">No messages yet.</div>;
	}

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-3">
			{safeMessages.map((m) => {
				const key = m?._clientId || m?._id || `${m?.author || 'a'}:${m?.time || ''}:${m?.message || ''}`;
				return <MessageBubble key={key} message={m} isMe={isMine(m?.author, currentUser)} />;
			})}
			<div ref={endRef} />
		</div>
	);
}
