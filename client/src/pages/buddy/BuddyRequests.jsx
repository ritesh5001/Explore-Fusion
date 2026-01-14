import { useEffect, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeRequests = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.requests ?? data?.items ?? data);
};

const getReqId = (r) => r?._id || r?.id;

const getFromUser = (r) => r?.from || r?.fromUser || r?.requester || r?.user || r?.sender;

export default function BuddyRequests() {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);
	const [actingOn, setActingOn] = useState(null);

	const load = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await API.get('/matches/requests');
			setItems(normalizeRequests(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load requests';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const act = async (matchId, action) => {
		if (!matchId) return;
		setActingOn(matchId);
		try {
			await API.post(`/matches/${matchId}/${action}`);
			showToast(action === 'accept' ? 'Request accepted' : 'Request rejected', 'success');
			setItems((prev) => asArray(prev).filter((r) => getReqId(r) !== matchId));
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Action failed';
			showToast(msg, 'error');
		} finally {
			setActingOn(null);
		}
	};

	return (
		<div className="container-app page-section max-w-5xl">
			<SectionHeader
				title="Buddy Requests"
				right={
					<Button variant="link" onClick={load} aria-label="Refresh buddy requests">
						Refresh
					</Button>
				}
			/>

			<div className="mt-6">
				{loading ? (
					<PageLoader label="Loading requests…" />
				) : error ? (
					<ErrorState title="Couldn’t load requests" description={error} onRetry={load} />
				) : items.length === 0 ? (
					<EmptyState title="No data yet" description="No pending requests." />
				) : (
					<div className="space-y-3">
						{items.map((r) => {
							const id = getReqId(r);
							const from = getFromUser(r);
							const name = from?.name || from?.fullName || from?.email || 'Traveler';
							const busy = actingOn === id;
							return (
								<Card key={id} className="p-4 flex items-center justify-between gap-4">
									<div className="min-w-0">
										<div className="font-semibold text-mountain dark:text-sand truncate">{name}</div>
										<div className="text-sm text-charcoal/70 dark:text-sand/70 mt-1">Incoming buddy request</div>
									</div>
									<div className="flex items-center gap-2 shrink-0">
										<Button
											onClick={() => act(id, 'accept')}
											disabled={busy}
											size="sm"
											variant="primary"
											aria-label="Accept request"
										>
											{busy ? 'Working…' : 'Accept'}
										</Button>
										<Button
											onClick={() => act(id, 'reject')}
											disabled={busy}
											size="sm"
											variant="danger"
											aria-label="Reject request"
										>
											{busy ? 'Working…' : 'Reject'}
										</Button>
									</div>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
