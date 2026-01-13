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
					`max-w-[80%] rounded-lg px-4 py-3 border ` +
					(isMe
						? 'bg-forest text-white border-olive'
						: 'bg-gray-100 text-gray-900 border-gray-200')
				}
			>
				<div className={`text-xs font-semibold ${isMe ? 'text-white/80' : 'text-gray-600'}`}>{author}</div>
				<div className="mt-1 whitespace-pre-wrap break-words">{text}</div>
				<div className={`mt-2 flex items-center justify-end gap-2 text-[11px] ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
					{!!time && <span>{time}</span>}
					{pending && <span className={isMe ? 'text-white/80' : 'text-gray-500'}>Sending…</span>}
					{failed && <span className="text-red-200">Failed</span>}
				</div>
			</div>
		</div>
	);
}
