import { useEffect, useState } from 'react';
import API from '../api';
import Loader from '../components/Loader';
import { useToast } from '../components/ToastProvider';

const asArray = (v) => (Array.isArray(v) ? v : []);

const Buddy = () => {
	const { showToast } = useToast();
	const [tab, setTab] = useState('profile');

	const [profile, setProfile] = useState(null);
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileError, setProfileError] = useState('');

	const [suggestions, setSuggestions] = useState([]);
	const [suggestionsLoading, setSuggestionsLoading] = useState(false);
	const [suggestionsError, setSuggestionsError] = useState('');

	const [requests, setRequests] = useState([]);
	const [requestsLoading, setRequestsLoading] = useState(false);
	const [requestsError, setRequestsError] = useState('');

	const [matches, setMatches] = useState([]);
	const [matchesLoading, setMatchesLoading] = useState(false);
	const [matchesError, setMatchesError] = useState('');

	const [destinationPreferences, setDestinationPreferences] = useState('');
	const [interests, setInterests] = useState('');
	const [travelStyle, setTravelStyle] = useState('');
	const [bio, setBio] = useState('');

	const normalizeCsv = (raw) =>
		String(raw || '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

	const loadProfile = async () => {
		setProfileError('');
		setProfileLoading(true);
		try {
			const res = await API.get('/matches/profile/me');
			const p = res?.data?.data ?? res?.data;
			setProfile(p);
			setDestinationPreferences(asArray(p?.destinationPreferences).join(', '));
			setInterests(asArray(p?.interests).join(', '));
			setTravelStyle(p?.travelStyle || '');
			setBio(p?.bio || '');
		} catch (e) {
			const status = e?.response?.status;
			if (status === 404) {
				setProfile(null);
			} else {
				setProfile(null);
				setProfileError(e?.response?.data?.message || e?.message || 'Failed to load profile');
			}
		} finally {
			setProfileLoading(false);
		}
	};

	const saveProfile = async (evt) => {
		evt.preventDefault();
		try {
			setProfileLoading(true);
			const payload = {
				destinationPreferences: normalizeCsv(destinationPreferences),
				interests: normalizeCsv(interests),
				travelStyle: travelStyle || undefined,
				bio: bio || undefined,
			};
			const res = await API.post('/matches/profile', payload);
			const p = res?.data?.data ?? res?.data;
			setProfile(p);
			showToast('Profile saved', 'success');
		} catch (e) {
			showToast(e?.response?.data?.message || e?.message || 'Failed to save profile', 'error');
		} finally {
			setProfileLoading(false);
		}
	};

	const loadSuggestions = async () => {
		setSuggestionsError('');
		setSuggestionsLoading(true);
		try {
			const res = await API.get('/matches/suggestions');
			const list = res?.data?.data ?? res?.data;
			setSuggestions(asArray(list));
		} catch (e) {
			setSuggestions([]);
			setSuggestionsError(e?.response?.data?.message || e?.message || 'Failed to load suggestions');
		} finally {
			setSuggestionsLoading(false);
		}
	};

	const loadRequests = async () => {
		setRequestsError('');
		setRequestsLoading(true);
		try {
			const res = await API.get('/matches/requests');
			const list = res?.data?.data ?? res?.data;
			setRequests(asArray(list));
		} catch (e) {
			setRequests([]);
			setRequestsError(e?.response?.data?.message || e?.message || 'Failed to load requests');
		} finally {
			setRequestsLoading(false);
		}
	};

	const loadMatches = async () => {
		setMatchesError('');
		setMatchesLoading(true);
		try {
			const res = await API.get('/matches/my');
			const list = res?.data?.data ?? res?.data;
			setMatches(asArray(list));
		} catch (e) {
			setMatches([]);
			setMatchesError(e?.response?.data?.message || e?.message || 'Failed to load matches');
		} finally {
			setMatchesLoading(false);
		}
	};

	useEffect(() => {
		loadProfile();
	}, []);

	useEffect(() => {
		if (tab === 'profile') loadProfile();
		if (tab === 'suggestions') loadSuggestions();
		if (tab === 'requests') loadRequests();
		if (tab === 'matches') loadMatches();
	}, [tab]);

	const requestBuddy = async (userId) => {
		try {
			await API.post(`/matches/${userId}/request`);
			showToast('Request sent', 'success');
			await loadSuggestions();
		} catch (e) {
			showToast(e?.response?.data?.message || e?.message || 'Failed to send request', 'error');
		}
	};

	const accept = async (matchId) => {
		try {
			await API.post(`/matches/${matchId}/accept`);
			showToast('Accepted', 'success');
			await loadRequests();
			await loadMatches();
		} catch (e) {
			showToast(e?.response?.data?.message || e?.message || 'Failed to accept', 'error');
		}
	};

	const reject = async (matchId) => {
		try {
			await API.post(`/matches/${matchId}/reject`);
			showToast('Rejected', 'success');
			await loadRequests();
		} catch (e) {
			showToast(e?.response?.data?.message || e?.message || 'Failed to reject', 'error');
		}
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-2xl font-bold">Buddy Finder</h1>
				<div className="flex gap-2">
					{[
						{ key: 'profile', label: 'My Profile' },
						{ key: 'suggestions', label: 'Suggestions' },
						{ key: 'requests', label: 'Requests' },
						{ key: 'matches', label: 'My Matches' },
					].map((t) => (
						<button
							key={t.key}
							onClick={() => setTab(t.key)}
							className={`px-4 py-2 rounded border ${tab === t.key ? 'bg-gray-900 text-white' : 'bg-white'}`}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>

			{tab === 'profile' && (
				<div className="bg-white rounded-lg shadow p-6">
					{profileLoading ? (
						<Loader label="Loading profile..." />
					) : profileError ? (
						<div className="text-red-600 text-sm">{profileError}</div>
					) : (
						<form onSubmit={saveProfile} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Destination preferences (comma separated)
								</label>
								<input
									value={destinationPreferences}
									onChange={(e) => setDestinationPreferences(e.target.value)}
									className="w-full border rounded px-3 py-2"
									placeholder="Bali, Goa, Manali"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Interests (comma separated)</label>
								<input
									value={interests}
									onChange={(e) => setInterests(e.target.value)}
									className="w-full border rounded px-3 py-2"
									placeholder="Food, Hiking, Photography"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Travel style</label>
								<select
									value={travelStyle}
									onChange={(e) => setTravelStyle(e.target.value)}
									className="w-full border rounded px-3 py-2"
								>
									<option value="">(optional)</option>
									<option value="budget">budget</option>
									<option value="luxury">luxury</option>
									<option value="adventure">adventure</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
								<textarea
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									className="w-full border rounded px-3 py-2 h-24"
									placeholder="A short intro..."
								/>
							</div>
							<button
								type="submit"
								className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700"
							>
								Save profile
							</button>
							{profile && (
								<div className="text-xs text-gray-500">
									Last updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '—'}
								</div>
							)}
						</form>
					)}
				</div>
			)}

			{tab === 'suggestions' && (
				<div className="bg-white rounded-lg shadow p-6">
					{suggestionsLoading ? (
						<Loader label="Loading suggestions..." />
					) : suggestionsError ? (
						<div className="text-red-600 text-sm">{suggestionsError}</div>
					) : suggestions.length === 0 ? (
						<div className="text-gray-600">No suggestions. Create your profile first.</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{suggestions.map((s) => (
								<div key={s.userId} className="border rounded p-4">
									<div className="text-sm text-gray-500">Score: {s.score}</div>
									<div className="mt-2 text-sm">
										<span className="font-semibold">Destinations:</span> {asArray(s.destinationPreferences).join(', ') || '—'}
									</div>
									<div className="mt-1 text-sm">
										<span className="font-semibold">Interests:</span> {asArray(s.interests).join(', ') || '—'}
									</div>
									<div className="mt-1 text-sm">
										<span className="font-semibold">Style:</span> {s.travelStyle || '—'}
									</div>
									{s.bio && <div className="mt-2 text-sm text-gray-700">{s.bio}</div>}
									<button
										onClick={() => requestBuddy(s.userId)}
										className="mt-3 bg-green-600 text-white font-bold px-3 py-2 rounded hover:bg-green-700"
									>
										Send request
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{tab === 'requests' && (
				<div className="bg-white rounded-lg shadow p-6">
					{requestsLoading ? (
						<Loader label="Loading requests..." />
					) : requestsError ? (
						<div className="text-red-600 text-sm">{requestsError}</div>
					) : requests.length === 0 ? (
						<div className="text-gray-600">No incoming requests.</div>
					) : (
						<div className="space-y-3">
							{requests.map((r) => (
								<div key={r._id} className="border rounded p-4 flex items-center justify-between gap-4">
									<div>
										<div className="text-sm text-gray-600">From: {r.requesterId}</div>
										<div className="text-xs text-gray-500">
											Created: {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
										</div>
									</div>
									<div className="flex gap-2">
										<button onClick={() => accept(r._id)} className="px-3 py-2 rounded bg-blue-600 text-white">
											Accept
										</button>
										<button onClick={() => reject(r._id)} className="px-3 py-2 rounded bg-gray-200">
											Reject
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{tab === 'matches' && (
				<div className="bg-white rounded-lg shadow p-6">
					{matchesLoading ? (
						<Loader label="Loading matches..." />
					) : matchesError ? (
						<div className="text-red-600 text-sm">{matchesError}</div>
					) : matches.length === 0 ? (
						<div className="text-gray-600">No matches yet.</div>
					) : (
						<div className="space-y-3">
							{matches.map((m) => (
								<div key={m._id} className="border rounded p-4">
									<div className="text-sm">Requester: {m.requesterId}</div>
									<div className="text-sm">Receiver: {m.receiverId}</div>
									<div className="text-xs text-gray-500 mt-1">
										Matched: {m.matchedAt ? new Date(m.matchedAt).toLocaleString() : '—'}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Buddy;
