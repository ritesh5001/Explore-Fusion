export default function ChatBubble({ role, text, time }) {
	const isUser = role === 'user';
	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
			<div
				className={
					`max-w-[85%] rounded-2xl px-4 py-3 border ` +
					(isUser
						? 'bg-forest text-white border-olive'
						: 'bg-white/70 backdrop-blur-md text-gray-900 border-soft')
				}
			>
				<div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</div>
				{!!time && (
					<div className={`mt-2 text-[11px] text-right ${isUser ? 'text-white/80' : 'text-gray-500'}`}>{time}</div>
				)}
			</div>
		</div>
	);
}
