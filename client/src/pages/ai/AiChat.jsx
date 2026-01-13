import { useEffect, useMemo, useRef, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import useAuth from '../../auth/useAuth';
import ChatBubble from '../../components/ai/ChatBubble';

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function AiChat() {
	useAuth();
	const { showToast } = useToast();
	const [messages, setMessages] = useState(() => [
		{ role: 'ai', text: 'Hi! Ask me to plan trips, budgets, or itineraries.', time: nowTime() },
	]);
	const [input, setInput] = useState('');
	const [thinking, setThinking] = useState(false);
	const [error, setError] = useState('');

	const endRef = useRef(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages.length, thinking]);

	const canSend = useMemo(() => input.trim().length > 0 && !thinking, [input, thinking]);

	const send = async () => {
		const text = input.trim();
		if (!text || thinking) return;
		setError('');
		setInput('');

		setMessages((prev) => [...prev, { role: 'user', text, time: nowTime() }]);
		setThinking(true);
		try {
			const res = await API.post('/ai/support-chat', { message: text });
			const reply = res?.data?.reply ?? res?.data?.data?.reply;
			if (!reply) throw new Error('AI reply missing');
			setMessages((prev) => [...prev, { role: 'ai', text: String(reply), time: nowTime() }]);
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'AI request failed';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			showToast('AI chat failed', 'error');
		} finally {
			setThinking(false);
		}
	};

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-2">AI Travel Assistant</h1>
			<p className="text-gray-600 mb-6">Chat with AI for trip ideas and planning help.</p>

			<div className="bg-white border rounded-lg shadow-sm h-[75vh] flex flex-col">
				<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
					{messages.map((m, idx) => (
						<ChatBubble key={idx} role={m.role} text={m.text} time={m.time} />
					))}
					{thinking && (
						<div className="text-sm text-gray-500">AI is thinking…</div>
					)}
					<div ref={endRef} />
				</div>

				<div className="border-t p-4">
					{!!error && <div className="mb-2 text-sm text-red-600">{error}</div>}
					<div className="flex gap-2">
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') send();
							}}
							placeholder="Plan a 5 day trip to Goa under budget…"
							className="flex-1 border rounded px-3 py-2 outline-none focus:border-blue-400"
							disabled={thinking}
						/>
						<button
							onClick={send}
							disabled={!canSend}
							className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
						>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
