import { useEffect, useState } from 'react';
import API from '../../api';
import BuddyCard from '../../components/buddy/BuddyCard';
import Button from '../../components/ui/Button';
import SectionHeader from '../../components/ui/SectionHeader';
import PageLoader from '../../components/states/PageLoader';
import ErrorState from '../../components/states/ErrorState';
import EmptyState from '../../components/states/EmptyState';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeMyBuddies = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.buddies ?? data?.matches ?? data?.items ?? data);
};

const getBuddyUser = (m) => m?.buddy || m?.user || m?.otherUser || m?.partner || m;

export default function MyBuddies() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);

	const load = async () => {
		setError('');
		setLoading(true);
		try {
			const res = await API.get('/matches/my');
			setItems(normalizeMyBuddies(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load buddies';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="max-w-5xl mx-auto px-4 py-10">
			<SectionHeader
				title="My Buddies"
				right={
					<Button variant="link" onClick={load} aria-label="Refresh buddies">
						Refresh
					</Button>
				}
			/>

			<div className="mt-6">
				{loading ? (
					<PageLoader label="Loading buddies…" />
				) : error ? (
					<ErrorState title="Couldn’t load buddies" description={error} onRetry={load} />
				) : items.length === 0 ? (
					<EmptyState title="No data yet" description="No buddies yet." />
				) : (
					<div className="space-y-3">
						{items.map((m, idx) => {
							const u = getBuddyUser(m);
							const id = u?._id || u?.id || idx;
							return <BuddyCard key={id} user={u} />;
						})}
					</div>
				)}
			</div>
		</div>
	);
}
