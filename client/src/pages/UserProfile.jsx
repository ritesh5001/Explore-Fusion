import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../api';
import useAuth from '../auth/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import Loader from '../components/ui/Loader';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../api/follow';

const isPrivileged = (role) => role === 'admin' || role === 'superadmin';

const normalizeUser = (body) => body?.data ?? body;

export default function UserProfile() {
	const { id } = useParams();
	const { user: currentUser } = useAuth();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [profile, setProfile] = useState(null);

	const [followersCount, setFollowersCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);

	const [isFollowing, setIsFollowing] = useState(false);
	const [buttonLoading, setButtonLoading] = useState(false);

	const canShowFollowButton = useMemo(() => {
		if (!currentUser || !profile) return false;
		if (!profile?._id || !currentUser?._id) return false;
		if (String(profile._id) === String(currentUser._id)) return false;
		if (isPrivileged(profile.role)) return false;
		if (currentUser.role === 'superadmin') return false;
		return true;
	}, [currentUser, profile]);

	useEffect(() => {
		if (!id) return;
		let ignore = false;

		const load = async () => {
			setLoading(true);
			setError('');
			try {
				// 1) Load user profile
				const res = await API.get(`/users/${id}`);
				const p = normalizeUser(res?.data);
				if (!ignore) setProfile(p || null);

				// 2) Load counts for viewed profile
				const [followers, following] = await Promise.all([getFollowers(id), getFollowing(id)]);
				if (!ignore) {
					setFollowersCount(Number(followers?.followersCount ?? 0));
					setFollowingCount(Number(following?.followingCount ?? 0));
				}

				// 3) Determine whether current user follows this profile
				if (currentUser?._id) {
					const mine = await getFollowing(currentUser._id);
					const list = Array.isArray(mine?.following) ? mine.following : [];
					const match = list.some((x) => String(x?.followingId) === String(id));
					if (!ignore) setIsFollowing(match);
				}
			} catch (e) {
				const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load profile';
				if (!ignore) {
					setError(msg);
					setProfile(null);
				}
			} finally {
				if (!ignore) setLoading(false);
			}
		};

		load();
		return () => {
			ignore = true;
		};
	}, [id, currentUser?._id]);

	const onToggleFollow = async () => {
		if (!profile?._id) return;
		setButtonLoading(true);
		try {
			if (isFollowing) {
				const resp = await unfollowUser(profile._id);
				setIsFollowing(false);
				if (resp?.followersCount !== undefined) {
					setFollowersCount(Number(resp.followersCount));
				}
			} else {
				const resp = await followUser(profile._id);
				setIsFollowing(true);
				if (resp?.followersCount !== undefined) {
					setFollowersCount(Number(resp.followersCount));
				}
			}
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to update follow';
			setError(msg);
		} finally {
			setButtonLoading(false);
		}
	};

	if (loading) return <Loader label="Loading profile…" />;

	return (
		<div className="container-app page-section max-w-3xl">
			<div className="mb-4">
				<Button as={Link} to="/" variant="ghost" size="sm">
					← Back
				</Button>
			</div>

			{error && (
				<Card className="p-4 border border-red-200 bg-red-50 text-red-800">
					{error}
				</Card>
			)}

			{profile && (
				<Card className="p-6">
					<SectionHeader
						title={profile?.name || profile?.email || 'Profile'}
						subtitle={profile?.role ? `Role: ${profile.role}` : undefined}
						right={
							canShowFollowButton ? (
								<Button
									onClick={onToggleFollow}
									disabled={buttonLoading}
									variant={isFollowing ? 'outline' : 'primary'}
								>
									{buttonLoading ? 'Loading…' : isFollowing ? 'Following' : 'Follow'}
								</Button>
							) : null
						}
					/>

					<div className="mt-4 grid grid-cols-2 gap-4 text-center">
						<div className="rounded-2xl border border-soft dark:border-white/10 p-4">
							<div className="text-xs text-charcoal/60 dark:text-sand/60">Followers</div>
							<div className="text-2xl font-bold">{followersCount}</div>
						</div>
						<div className="rounded-2xl border border-soft dark:border-white/10 p-4">
							<div className="text-xs text-charcoal/60 dark:text-sand/60">Following</div>
							<div className="text-2xl font-bold">{followingCount}</div>
						</div>
					</div>
				</Card>
			)}
		</div>
	);
}
