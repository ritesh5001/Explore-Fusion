import { useEffect, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import BuddyCard from '../../components/buddy/BuddyCard';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeSuggestions = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.suggestions ?? data?.users ?? data);
};

export default function BuddySuggestions() {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);
	const [sendingTo, setSendingTo] = useState(null);

	const load = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await API.get('/matches/suggestions');
			setItems(normalizeSuggestions(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load suggestions';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const sendRequest = async (userId) => {
		if (!userId) return;
		setSendingTo(userId);
		try {
			await API.post(`/matches/${userId}/request`);
			showToast('Request sent', 'success');
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Request failed';
			showToast(msg, 'error');
		} finally {
			setSendingTo(null);
		}
	};

	return (
		<div className="container-app page-section max-w-5xl">
			<SectionHeader
				title="Buddy Suggestions"
				subtitle="People you might enjoy traveling with."
				right={
					<Button variant="outline" size="sm" onClick={load} aria-label="Refresh buddy suggestions">
						Refresh
					</Button>
				}
			/>

			{loading ? (
				<PageLoader label="Loading suggestions…" />
			) : error ? (
				<ErrorState title="Couldn’t load suggestions" description={error} onRetry={load} />
			) : items.length === 0 ? (
				<EmptyState title="No suggestions right now" description="Check back soon — we’ll keep matching." icon="🧭" />
			) : (
				<div className="space-y-3">
					{items.map((u) => {
						const id = u?._id || u?.id;
						return (
							<BuddyCard
								key={id}
								user={u}
								actions={
									<Button
										onClick={() => sendRequest(id)}
										disabled={sendingTo === id}
										size="sm"
										aria-label="Send buddy request"
									>
										{sendingTo === id ? 'Sending…' : 'Request'}
									</Button>
								}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
