import { useMemo, useState } from 'react';
import API from '../../api';
import useAuth from '../../auth/useAuth';
import { useToast } from '../../components/ToastProvider';
import ItineraryDayCard from '../../components/ai/ItineraryDayCard';

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

	const generate = async (e) => {
		e.preventDefault();
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
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-2">AI Itinerary Generator</h1>
			<p className="text-gray-600 mb-6">Generate a day-by-day plan and save it to your account.</p>

			<form onSubmit={generate} className="bg-white border rounded-lg p-5 grid md:grid-cols-4 gap-4">
				<div className="md:col-span-2">
					<label className="block text-sm font-semibold text-gray-700">Destination</label>
					<input
						value={destination}
						onChange={(e) => setDestination(e.target.value)}
						className="mt-1 w-full border rounded px-3 py-2"
						placeholder="Goa"
					/>
				</div>
				<div>
					<label className="block text-sm font-semibold text-gray-700">Days</label>
					<input
						type="number"
						min={1}
						value={days}
						onChange={(e) => setDays(e.target.value)}
						className="mt-1 w-full border rounded px-3 py-2"
					/>
				</div>
				<div>
					<label className="block text-sm font-semibold text-gray-700">Budget</label>
					<input
						type="number"
						min={1}
						value={budget}
						onChange={(e) => setBudget(e.target.value)}
						className="mt-1 w-full border rounded px-3 py-2"
					/>
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm font-semibold text-gray-700">Travel style</label>
					<select value={style} onChange={(e) => setStyle(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
						<option value="budget">budget</option>
						<option value="luxury">luxury</option>
						<option value="adventure">adventure</option>
					</select>
				</div>
				<div className="md:col-span-2 flex items-end gap-2">
					<button
						type="submit"
						disabled={!canGenerate}
						className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
					>
						{loading ? 'Generating…' : 'Generate'}
					</button>
					<button
						type="button"
						onClick={save}
						disabled={!canSave}
						className="bg-gray-900 text-white font-bold px-4 py-2 rounded hover:bg-black disabled:opacity-60"
					>
						{saving ? 'Saving…' : 'Save itinerary'}
					</button>
				</div>
			</form>

			{!!error && <div className="mt-4 text-sm text-red-600">{error}</div>}

			<div className="mt-6">
				{loading ? (
					<div className="bg-white border rounded-lg p-6 text-gray-600">AI is building your itinerary…</div>
				) : result.length === 0 ? (
					<div className="bg-white border rounded-lg p-6 text-gray-600">No itinerary yet. Fill the form and generate.</div>
				) : (
					<div className="relative">
						<div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
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
