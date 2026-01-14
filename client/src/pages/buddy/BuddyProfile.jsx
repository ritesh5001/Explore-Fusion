import { useEffect, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/ToastProvider';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

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
				// First-time users won't have a profile yet.
				if (status === 404) {
					setProfile({ bio: '', interests: '', location: '' });
					setError('');
					return;
				}
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
			<h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight mb-6">Buddy Profile</h1>

			{loading ? (
				<Card className="p-6 text-charcoal/70 dark:text-sand/70">Loading…</Card>
			) : (
				<form onSubmit={onSave} className="space-y-4">
					{error && (
						<Card className="p-4 border-red-200/60 dark:border-red-300/30">
							<div className="text-sm text-red-700 dark:text-red-300">{error}</div>
						</Card>
					)}
					<Card className="p-6 space-y-4">
						<Input
							label="Location"
							value={profile.location}
							onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
						/>
						<Input
							label="Interests (comma-separated)"
							value={profile.interests}
							onChange={(e) => setProfile((p) => ({ ...p, interests: e.target.value }))}
						/>
						<Textarea
							label="Bio"
							value={profile.bio}
							onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
						/>

						<Button type="submit" loading={saving} className="w-full">
							Save Profile
						</Button>
					</Card>
				</form>
			)}
		</div>
	);
}
