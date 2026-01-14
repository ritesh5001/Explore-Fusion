import { useMemo, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import ItineraryDayCard from '../../components/ai/ItineraryDayCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Loader';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeItinerary = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.itinerary ?? data);
};

export default function AiItinerary() {
	useAuth();
	const { showToast } = useToast();
	const [destination, setDestination] = useState('');
	const [days, setDays] = useState(5);
	const [budget, setBudget] = useState(15000);
	const [style, setStyle] = useState('budget');

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [result, setResult] = useState([]);

	const canGenerate = useMemo(() => destination.trim() && Number(days) > 0 && Number(budget) > 0 && !loading, [destination, days, budget, loading]);

	const generate = async () => {
		if (!canGenerate) return;
		setError('');
		setLoading(true);
		setResult([]);
		try {
			const payload = {
				destination: destination.trim(),
				days: Math.max(1, Math.floor(Number(days))),
				budget: Math.max(1, Math.floor(Number(budget))),
				style,
			};
			const res = await API.post('/ai/itinerary', payload);
			const itinerary = normalizeItinerary(res?.data);
			setResult(itinerary);
			if (!itinerary.length) showToast('No itinerary returned', 'error');
		} catch (e2) {
			const status = e2?.response?.status;
			const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Failed to generate itinerary';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			showToast('Itinerary generation failed', 'error');
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		await generate();
	};

	const canSave = useMemo(() => result.length > 0 && !saving, [result.length, saving]);

	const save = async () => {
		if (!canSave) return;
		setSaving(true);
		setError('');
		try {
			await API.post('/itineraries', {
				destination: destination.trim(),
				days: Math.max(1, Math.floor(Number(days))),
				budget: Math.max(1, Math.floor(Number(budget))),
				style,
				itinerary: result,
			});
			showToast('Itinerary saved', 'success');
		} catch (e3) {
			const status = e3?.response?.status;
			const msg = e3?.response?.data?.message || e3?.response?.data?.error || e3?.message || 'Failed to save itinerary';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			showToast('Save failed', 'error');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="container-app page-section max-w-5xl">
			<SectionHeader
				title="AI Itinerary Generator"
				subtitle="Generate a day-by-day plan and save it to your account."
			/>

			<Card className="mt-6 p-5">
				<form onSubmit={onSubmit} className="grid md:grid-cols-4 gap-4">
					<div className="md:col-span-2">
						<Input
							label="Destination"
							value={destination}
							onChange={(e) => setDestination(e.target.value)}
							placeholder="Goa"
						/>
					</div>
					<div>
						<Input
							label="Days"
							type="number"
							min={1}
							value={days}
							onChange={(e) => setDays(e.target.value)}
						/>
					</div>
					<div>
						<Input
							label="Budget"
							type="number"
							min={1}
							value={budget}
							onChange={(e) => setBudget(e.target.value)}
						/>
					</div>
					<div className="md:col-span-2">
						<Select label="Travel style" value={style} onChange={(e) => setStyle(e.target.value)}>
							<option value="budget">budget</option>
							<option value="luxury">luxury</option>
							<option value="adventure">adventure</option>
						</Select>
					</div>
					<div className="md:col-span-2 flex items-end gap-2">
						<Button type="submit" disabled={!canGenerate} aria-label="Generate itinerary">
							{loading ? 'Generating…' : 'Generate'}
						</Button>
						<Button type="button" onClick={save} disabled={!canSave} variant="outline" aria-label="Save itinerary">
							{saving ? 'Saving…' : 'Save itinerary'}
						</Button>
					</div>
				</form>
			</Card>

			<div className="mt-6">
				{loading ? (
					<div className="space-y-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<Card key={i} className="p-5">
								<Skeleton className="h-4 w-28" />
								<div className="mt-3 space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
									<Skeleton className="h-4 w-2/3" />
								</div>
							</Card>
						))}
					</div>
				) : error ? (
					<ErrorState title="Couldn’t generate itinerary" description={error} onRetry={generate} />
				) : result.length === 0 ? (
					<EmptyState title="No data yet" description="Fill the form and generate an itinerary." />
				) : (
					<div className="relative">
						<div className="absolute left-4 top-0 bottom-0 w-px bg-soft dark:bg-white/10" />
						<div className="space-y-4">
							{result.map((d, idx) => (
								<ItineraryDayCard key={d?.day || idx} day={d?.day ?? idx + 1} plan={d?.plan ?? String(d)} />
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
