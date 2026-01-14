import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Loader';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeList = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.itineraries ?? data?.items ?? data);
};

const getId = (it) => it?._id || it?.id;

export default function MyItineraries() {
	useAuth();
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [items, setItems] = useState([]);
	const [deletingId, setDeletingId] = useState(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const res = await API.get('/itineraries/my');
			setItems(normalizeList(res?.data));
		} catch (e) {
			const status = e?.response?.status;
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load itineraries';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			setItems([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const list = useMemo(() => asArray(items), [items]);

	const remove = async (id) => {
		if (!id) return;
		setDeletingId(id);
		try {
			await API.delete(`/itineraries/${id}`);
			setItems((prev) => asArray(prev).filter((x) => getId(x) !== id));
			showToast('Itinerary deleted', 'success');
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Delete failed';
			showToast(msg, 'error');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="container-app page-section max-w-6xl">
			<SectionHeader
				title="My Itineraries"
				right={
					<Button variant="outline" size="sm" onClick={load} aria-label="Refresh itineraries">
						Refresh
					</Button>
				}
			/>

			<div className="mt-6">
				{loading ? (
					<div className="grid md:grid-cols-2 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Card key={i} className="p-5">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1 space-y-2">
										<Skeleton className="h-4 w-40" />
										<Skeleton className="h-4 w-64" />
									</div>
									<Skeleton className="h-9 w-24 rounded-2xl" />
								</div>
								<div className="mt-4 space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
								</div>
							</Card>
						))}
					</div>
				) : error ? (
					<ErrorState title="Couldn’t load itineraries" description={error} onRetry={load} />
				) : list.length === 0 ? (
					<EmptyState title="No data yet" description="No itineraries yet." />
				) : (
					<div className="grid md:grid-cols-2 gap-4">
						{list.map((it) => {
							const id = getId(it);
							const title = it?.destination || it?.title || 'Itinerary';
							const days = it?.days;
							const style = it?.style;
							const budget = it?.budget;
							const preview = Array.isArray(it?.itinerary) ? it.itinerary : [];
							return (
								<Card key={id} className="p-5">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="font-semibold text-mountain dark:text-sand truncate">{title}</div>
											<div className="mt-2 flex flex-wrap items-center gap-2">
												{days ? <Badge>{days} days</Badge> : null}
												{style ? <Badge tone="accent">{style}</Badge> : null}
												{budget != null ? <Badge tone="gold">Budget {budget}</Badge> : null}
											</div>
										</div>
										<Button
											onClick={() => remove(id)}
											disabled={deletingId === id}
											variant="danger"
											size="sm"
											aria-label="Delete itinerary"
										>
											{deletingId === id ? 'Deleting…' : 'Delete'}
										</Button>
									</div>

									{preview.length > 0 && (
										<div className="mt-4 space-y-2">
											{preview.slice(0, 3).map((d, idx) => (
												<div key={idx} className="text-sm text-charcoal/80 dark:text-sand/80">
													Day {d?.day ?? idx + 1}: {d?.plan ?? String(d)}
												</div>
											))}
											{preview.length > 3 && <div className="text-xs text-charcoal/60 dark:text-sand/60">+ more days…</div>}
										</div>
									)}
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
