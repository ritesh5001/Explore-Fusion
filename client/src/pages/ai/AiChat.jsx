import { useEffect, useMemo, useRef, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import useAuth from '../../auth/useAuth';
import ChatBubble from '../../components/ai/ChatBubble';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SectionHeader from '../../components/ui/SectionHeader';
import ErrorState from '../../components/ui/ErrorState';
import Input from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Loader';

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
	const [lastPrompt, setLastPrompt] = useState('');

	const endRef = useRef(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages.length, thinking]);

	const canSend = useMemo(() => input.trim().length > 0 && !thinking, [input, thinking]);

	const sendMessage = async (text) => {
		const trimmed = String(text || '').trim();
		if (!trimmed || thinking) return;
		setError('');
		setLastPrompt(trimmed);

		setMessages((prev) => [...prev, { role: 'user', text: trimmed, time: nowTime() }]);
		setThinking(true);
		try {
			const res = await API.post('/ai/support-chat', { message: trimmed });
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

	const send = async () => {
		const text = input.trim();
		if (!text || thinking) return;
		setInput('');
		await sendMessage(text);
	};

	return (
		<div className="container-app page-section max-w-5xl">
			<SectionHeader
				title="AI Travel Assistant"
				subtitle="Chat with AI for trip ideas, budgets, and planning help."
			/>

			<Card className="mt-6 h-[75vh] flex flex-col overflow-hidden">
				<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-soft/40 dark:bg-black/20">
					{messages.map((m, idx) => (
						<ChatBubble key={idx} role={m.role} text={m.text} time={m.time} />
					))}
					{thinking && (
						<div className="space-y-2">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-4 w-72" />
						</div>
					)}
					<div ref={endRef} />
				</div>

				<div className="border-t border-soft/80 dark:border-white/10 p-4">
					{!!error && !thinking && (
						<ErrorState
							className="mb-3 p-4"
							title="AI chat failed"
							description={error}
							onRetry={lastPrompt ? () => sendMessage(lastPrompt) : undefined}
							retryLabel="Retry"
						/>
					)}
					<div className="flex flex-col sm:flex-row gap-2">
						<Input
							label="Ask the assistant"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') send();
							}}
							disabled={thinking}
							className="flex-1"
							inputClassName="pr-4"
						/>
						<Button onClick={send} disabled={!canSend} aria-label="Send message">
							Send
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
