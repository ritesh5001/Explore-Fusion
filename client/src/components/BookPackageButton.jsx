import { useState } from 'react';
import API from '../api';
import { useToast } from './ToastProvider';
import Button from './ui/Button';

export default function BookPackageButton({ packageId }) {
	const { showToast } = useToast();
	const [guests, setGuests] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const onBook = async () => {
		if (!packageId) return;
		setError('');
		setLoading(true);
		try {
			const guestsNum = Math.max(1, Math.floor(Number(guests) || 1));
			await API.post('/bookings', { packageId, guests: guestsNum });
			showToast('Booking confirmed', 'success');
		} catch (e) {
			const status = e?.response?.status;
			const serverMessage = e?.response?.data?.message || e?.response?.data?.error;
			const msg = serverMessage || e?.message || 'Booking failed';
			setError(`${msg}${status ? ` (HTTP ${status})` : ''}`);
			showToast('Booking failed', 'error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="flex items-center gap-3">
				<label className="text-sm font-medium text-charcoal/80">Guests</label>
				<input
					type="number"
					min={1}
					value={guests}
					onChange={(e) => setGuests(e.target.value)}
					className={
						'w-24 rounded-xl px-3 py-2 text-sm ' +
						'bg-white/70 text-charcoal ' +
						'border border-border ' +
						'focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-charcoal/20 ' +
						'transition-[border-color,box-shadow,background-color] duration-200 ease-standard'
					}
				/>
				<Button
					onClick={onBook}
					disabled={loading}
					className="ml-auto"
				>
					{loading ? 'Booking…' : 'Book Now'}
				</Button>
			</div>
			{!!error && <div className="mt-2 text-sm text-red-600">{error}</div>}
		</div>
	);
}
