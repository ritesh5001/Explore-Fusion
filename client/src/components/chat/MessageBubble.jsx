export default function MessageBubble({ message, isMe }) {
	const author = message?.author ?? 'Unknown';
	const text = message?.message ?? '';
	const time = message?.time ?? '';
	const pending = Boolean(message?.pending);
	const failed = Boolean(message?.failed);

	return (
		<div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
			<div
				className={
					`max-w-[80%] rounded-2xl px-4 py-3 border backdrop-blur-md ` +
					(isMe
						? 'bg-forest text-white border-olive/60 dark:border-trail/20'
						: 'bg-white/70 dark:bg-white/5 text-charcoal dark:text-sand border-soft/80 dark:border-white/10')
				}
			>
				<div className={`text-xs font-semibold ${isMe ? 'text-white/80' : 'text-charcoal/60 dark:text-sand/60'}`}>{author}</div>
				<div className="mt-1 whitespace-pre-wrap break-words">{text}</div>
				<div
					className={`mt-2 flex items-center justify-end gap-2 text-[11px] ${
						isMe ? 'text-white/80' : 'text-charcoal/50 dark:text-sand/50'
					}`}
				>
					{!!time && <span>{time}</span>}
					{pending && <span className={isMe ? 'text-white/80' : 'text-charcoal/50 dark:text-sand/50'}>Sending…</span>}
					{failed && <span className="text-red-200">Failed</span>}
				</div>
			</div>
		</div>
	);
}
