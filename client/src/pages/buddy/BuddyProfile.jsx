import { useEffect, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';

export default function BuddyProfile() {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [profile, setProfile] = useState({ bio: '', interests: '', location: '' });

	useEffect(() => {
		const load = async () => {
			setError('');
			setLoading(true);
			try {
				const res = await API.get('/matches/profile/me');
				const data = res?.data?.data ?? res?.data;
				setProfile({
					bio: data?.bio || '',
					interests: Array.isArray(data?.interests) ? data.interests.join(', ') : data?.interests || '',
					location: data?.location || '',
				});
			} catch (e) {
				const status = e?.response?.status;
				const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load buddy profile';
				setError(msg + (status ? ` (HTTP ${status})` : ''));
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const onSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const interestsArray = String(profile.interests || '')
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			await API.post('/matches/profile', {
				bio: profile.bio,
				location: profile.location,
				interests: interestsArray,
			});
			showToast('Buddy profile saved', 'success');
		} catch (e2) {
			const status = e2?.response?.status;
			const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Save failed';
			setError(msg + (status ? ` (HTTP ${status})` : ''));
			showToast('Save failed', 'error');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 py-10">
			<h1 className="text-2xl font-bold mb-6">Buddy Profile</h1>

			{loading ? (
				<div className="bg-white border rounded-lg p-6 text-gray-600">Loading…</div>
			) : (
				<form onSubmit={onSave} className="bg-white border rounded-lg p-6 space-y-4">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">{error}</div>
					)}
					<div>
						<label className="block text-sm font-semibold text-gray-700">Location</label>
						<input
							value={profile.location}
							onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
							className="mt-1 w-full border rounded px-3 py-2"
							placeholder="e.g., Mumbai"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700">Interests (comma-separated)</label>
						<input
							value={profile.interests}
							onChange={(e) => setProfile((p) => ({ ...p, interests: e.target.value }))}
							className="mt-1 w-full border rounded px-3 py-2"
							placeholder="hiking, food, photography"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700">Bio</label>
						<textarea
							value={profile.bio}
							onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
							className="mt-1 w-full border rounded px-3 py-2 min-h-32"
							placeholder="Tell others about your travel vibe…"
						/>
					</div>

					<button
						type="submit"
						disabled={saving}
						className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
					>
						{saving ? 'Saving…' : 'Save Profile'}
					</button>
				</form>
			)}
		</div>
	);
}
