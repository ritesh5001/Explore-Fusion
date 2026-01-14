import { useEffect, useMemo, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Skeleton } from '../ui/Loader';

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
		return (
			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-3">
					<Skeleton className="h-5 w-2/3" />
					<Skeleton className="h-5 w-1/2" />
					<Skeleton className="h-5 w-3/5" />
					<Skeleton className="h-5 w-1/3" />
				</div>
			</div>
		);
	}

	if (!safeMessages.length) {
		return (
			<div className="flex-1 overflow-y-auto p-4 text-sm text-charcoal/70 dark:text-sand/70">
				No messages yet. Say hello.
			</div>
		);
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
