import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import ChatWindow from '../../components/chat/ChatWindow';
import TypingIndicator from '../../components/chat/TypingIndicator';
import { useToast } from '../../components/ToastProvider';
import { socket } from '../../utils/socket';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeHistory = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.history ?? data?.messages ?? data);
};

const normalizeMsg = (m) => {
	if (!m) return null;
	return {
		author: m.author,
		message: m.message,
		time: m.time,
	};
};

const signature = (m) => `${String(m?.author || '')}|${String(m?.message || '')}|${String(m?.time || '')}`;

const looksUnauthorized = (err) => {
	const msg = String(err?.message || err || '').toLowerCase();
	return msg.includes('unauthorized') || msg.includes('jwt') || msg.includes('token');
};

export default function ChatRoom() {
	const { showToast } = useToast();
	const { user, token, logout } = useAuth();
	const { roomId: rawRoomId } = useParams();
	const roomId = decodeURIComponent(rawRoomId || '');
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [typingUser, setTypingUser] = useState('');
	const [connected, setConnected] = useState(socket.connected);

	const typingTimerRef = useRef(null);
	const typingEmitTimerRef = useRef(null);

	const messageSetRef = useRef(new Set());

	const addMessages = (incoming, replace = false) => {
		const list = asArray(incoming).map(normalizeMsg).filter(Boolean);
		setMessages((prev) => {
			const next = replace ? [] : asArray(prev);
			const nextSet = replace ? new Set() : new Set(messageSetRef.current);
			for (const m of list) {
				const sig = signature(m);
				if (!nextSet.has(sig)) {
					nextSet.add(sig);
					next.push(m);
				}
			}
			messageSetRef.current = nextSet;
			return next;
		});
	};

	useEffect(() => {
		if (!token) return;

		let ignore = false;
		messageSetRef.current = new Set();
		setMessages([]);
		setLoading(true);

		const loadViaRestIfAvailable = async () => {
			try {
				const res = await API.get(`/chats/${encodeURIComponent(roomId)}`);
				const history = normalizeHistory(res?.data);
				if (!ignore && history.length) {
					addMessages(history, true);
				}
			} catch {
				// ignore; backend may rely fully on socket history
			}
		};

		loadViaRestIfAvailable().finally(() => {
			if (!ignore) setLoading(false);
		});

		return () => {
			ignore = true;
		};
	}, [roomId, token]);

	useEffect(() => {
		if (!token || !roomId) return;

		socket.auth = { token };
		if (!socket.connected) socket.connect();

		setConnected(socket.connected);

		const onConnect = () => {
			setConnected(true);
			try {
				socket.emit('joinRoom', { roomId });
			} catch {
				// ignore
			}
		};

		const onDisconnect = () => {
			setConnected(false);
		};

		const onConnectError = (err) => {
			setConnected(false);
			if (looksUnauthorized(err)) {
				showToast('Session expired. Please log in again.', 'error');
				logout();
				navigate('/login', { replace: true });
				return;
			}
			showToast('Chat connection error', 'error');
		};

		const onLoadHistory = (history) => {
			addMessages(history, messages.length === 0);
			setLoading(false);
		};

		const onReceiveMessage = (msg) => {
			addMessages([msg], false);
		};

		const onTyping = (payload) => {
			const who = payload?.user;
			if (!who) return;
			setTypingUser(String(who));
			if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
			typingTimerRef.current = setTimeout(() => setTypingUser(''), 1500);
		};

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('connect_error', onConnectError);
		socket.on('loadHistory', onLoadHistory);
		socket.on('receiveMessage', onReceiveMessage);
		socket.on('typing', onTyping);

		// If already connected, join immediately
		if (socket.connected) {
			onConnect();
		}

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('connect_error', onConnectError);
			socket.off('loadHistory', onLoadHistory);
			socket.off('receiveMessage', onReceiveMessage);
			socket.off('typing', onTyping);
			socket.disconnect();

			if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
			if (typingEmitTimerRef.current) clearTimeout(typingEmitTimerRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId, token]);

	const canSend = useMemo(() => Boolean(input.trim()), [input]);

	const send = () => {
		const message = input.trim();
		if (!message) return;
		if (!socket.connected) {
			showToast('Chat is disconnected', 'error');
			return;
		}

		// Optimistic append (will be deduped if server echoes back)
		const optimistic = {
			_clientId: `c_${Date.now()}_${Math.random().toString(16).slice(2)}`,
			author: user?.name || user?.email || 'Me',
			message,
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			pending: true,
		};
		addMessages([optimistic], false);

		try {
			socket.emit('sendMessage', { roomId, message });
			setInput('');
		} catch {
			showToast('Failed to send message', 'error');
		}
	};

	const onInputChange = (v) => {
		setInput(v);
		if (!socket.connected) return;
		if (typingEmitTimerRef.current) clearTimeout(typingEmitTimerRef.current);
		typingEmitTimerRef.current = setTimeout(() => {
			try {
				socket.emit('typing', { roomId });
			} catch {
				// ignore
			}
		}, 300);
	};

	return (
		<div className="container-app page-section max-w-5xl">
			<SectionHeader
				title="Chat"
				subtitle={roomId ? `Room: ${roomId}` : 'Room'}
				right={
					<div className="flex items-center gap-2">
						<Badge tone={connected ? 'success' : 'danger'}>{connected ? 'Connected' : 'Disconnected'}</Badge>
						<Button as={Link} to="/chat" variant="outline" size="sm">
							Back to rooms
						</Button>
					</div>
				}
			/>

			<Card className="mt-6 p-0 overflow-hidden">
				<div className="h-[70vh] flex flex-col">
					<ChatWindow messages={messages} currentUser={user} loading={loading} />
					<div className="px-4 pb-2">{typingUser && <TypingIndicator user={typingUser} />}</div>
					<div className="p-4 border-t border-soft/80 dark:border-white/10 flex flex-col sm:flex-row gap-2">
						<Input
							label="Message"
							type="text"
							value={input}
							onChange={(e) => onInputChange(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') send();
							}}
							disabled={!connected}
							className="flex-1"
							inputClassName="pr-4"
						/>
						<Button
							onClick={send}
							disabled={!connected || !canSend}
							className="sm:self-end"
						>
							Send
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
