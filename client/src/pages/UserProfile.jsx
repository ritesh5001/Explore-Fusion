import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import PageLoader from '../components/ui/PageLoader';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileActions from '../components/profile/ProfileActions';
import ProfilePostsGrid from '../components/profile/ProfilePostsGrid';
import { followUser, getFollowers, unfollowUser } from '../api/follow';
import { getUserProfile } from '../api/users';
import { getPostsByUser } from '../api/posts';

const isPrivileged = (role) => role === 'admin' || role === 'superadmin';

const normalizeProfileResponse = (body) => body?.data ?? body;

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeUsersList = (payload) => {
	const data = payload?.data ?? payload;
	return asArray(data?.followers ?? data?.following ?? data?.users ?? data);
};

const getUserId = (u) => u?._id || u?.id || u?.userId;

export default function UserProfile() {
	const { id } = useParams();
	const { user: currentUser } = useAuth();
	const { showToast } = useToast();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [profile, setProfile] = useState(null);

	const [followersCount, setFollowersCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const [postsCount, setPostsCount] = useState(0);

	const [isFollowing, setIsFollowing] = useState(false);
	const [followsYou, setFollowsYou] = useState(false);
	const [buttonLoading, setButtonLoading] = useState(false);

	const [postsLoading, setPostsLoading] = useState(false);
	const [posts, setPosts] = useState([]);
	const [postsError, setPostsError] = useState('');

	const canShowFollowButton = useMemo(() => {
		if (!currentUser || !profile) return false;
		if (!profile?._id || !currentUser?._id) return false;
		if (String(profile._id) === String(currentUser._id)) return false;
		if (isPrivileged(profile.role)) return false;
		if (currentUser.role === 'superadmin') return false;
		return true;
	}, [currentUser, profile]);
	const loadPosts = useCallback(
		async (targetUserId, { silent = false } = {}) => {
			if (!targetUserId) return;
			setPostsLoading(true);
			setPostsError('');
			try {
				const list = await getPostsByUser(targetUserId);
				setPosts(list);
			} catch (e) {
				const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load posts';
				setPosts([]);
				setPostsError(msg);
				if (!silent) showToast('Failed to load posts', 'error');
			} finally {
				setPostsLoading(false);
			}
		},
		[showToast]
	);

	const loadProfile = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		setError('');
		try {
			const res = await getUserProfile(id);
			const data = normalizeProfileResponse(res);
			const u = data?.user ?? data?.profile ?? data?.data?.user;
			setProfile(u || null);
			setFollowersCount(Number(data?.counts?.followers ?? 0));
			setFollowingCount(Number(data?.counts?.following ?? 0));
			setPostsCount(Number(data?.counts?.posts ?? 0));
			setIsFollowing(Boolean(data?.isFollowing));

			if (typeof data?.followsYou === 'boolean') {
				setFollowsYou(Boolean(data.followsYou));
			} else if (currentUser?._id && u?._id && String(currentUser._id) !== String(u._id)) {
				// Fallback: compute "follows you" from followers list of the viewer.
				try {
					const followersPayload = await getFollowers(currentUser._id);
					const list = normalizeUsersList(followersPayload);
					const found = list.some((x) => String(getUserId(x) || '') === String(u._id));
					setFollowsYou(found);
				} catch {
					setFollowsYou(false);
				}
			} else {
				setFollowsYou(false);
			}

			await loadPosts(id, { silent: true });
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load profile';
			setError(msg);
			setProfile(null);
			setPosts([]);
			setPostsError('');
			showToast(msg, 'error');
		} finally {
			setLoading(false);
		}
	}, [currentUser?._id, id, loadPosts, showToast]);

	useEffect(() => {
		let ignore = false;
		if (!id) return;
		loadProfile().catch(() => {
			if (!ignore) {
				// loadProfile handles its own errors; ignore here.
			}
		});
		return () => {
			ignore = true;
		};
	}, [id, loadProfile]);

	const onToggleFollow = async () => {
		if (!profile?._id) return;
		if (buttonLoading) return;
		setButtonLoading(true);
		const handle = profile?.username ? `@${profile.username}` : profile?.name || 'this user';

		// Optimistic UI
		const nextIsFollowing = !isFollowing;
		setIsFollowing(nextIsFollowing);
		setFollowersCount((c) => {
			const delta = nextIsFollowing ? 1 : -1;
			return Math.max(0, Number(c || 0) + delta);
		});

		try {
			if (isFollowing) {
				const resp = await unfollowUser(profile._id);
				if (resp?.followersCount !== undefined) setFollowersCount(Number(resp.followersCount));
				showToast(`Unfollowed ${handle}`, 'success');
			} else {
				const resp = await followUser(profile._id);
				if (resp?.followersCount !== undefined) setFollowersCount(Number(resp.followersCount));
				showToast(`Followed ${handle}`, 'success');
			}
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to update follow';
			// Rollback optimistic state
			setIsFollowing((v) => !v);
			setFollowersCount((c) => {
				const delta = nextIsFollowing ? -1 : 1;
				return Math.max(0, Number(c || 0) + delta);
			});
			showToast(msg, 'error');
		} finally {
			setButtonLoading(false);
		}
	};

	if (loading) {
		return <PageLoader label="Loading profile…" />;
	}

	return (
		<div className="container-app page-section max-w-3xl">
			<div className="mb-4">
				<Button as={Link} to="/" variant="ghost" size="sm">
					← Back
				</Button>
			</div>

			{error ? (
				<Card className="p-4 border border-red-200 bg-red-50 text-red-800">{error}</Card>
			) : null}

			{profile ? (
				<Card className="p-6">
					<SectionHeader title="Profile" />
					<ProfileHeader user={profile} />
					<ProfileActions
						isOwnProfile={String(profile?._id || '') === String(currentUser?._id || '')}
						canFollow={canShowFollowButton}
						isFollowing={isFollowing}
						followsYou={followsYou}
						username={profile?.username}
						loading={buttonLoading}
						onToggleFollow={onToggleFollow}
					/>
					<ProfileStats followers={followersCount} following={followingCount} posts={postsCount} />
				</Card>
			) : null}

			{profile ? (
				<div className="mt-6">
					<SectionHeader title="Posts" />
					<ProfilePostsGrid
						posts={posts}
						loading={postsLoading}
						error={postsError}
						onRetry={() => loadPosts(id)}
					/>
				</div>
			) : null}
		</div>
	);
}
