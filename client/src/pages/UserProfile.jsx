import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../api';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import Loader, { Skeleton } from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import SafeImage from '../components/common/SafeImage';
import LuxImage from '../components/ui/LuxImage';
import { followUser, unfollowUser } from '../api/follow';

const isPrivileged = (role) => role === 'admin' || role === 'superadmin';

const normalizeProfileResponse = (body) => body?.data ?? body;

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
	const [buttonLoading, setButtonLoading] = useState(false);

	const [postsLoading, setPostsLoading] = useState(false);
	const [posts, setPosts] = useState([]);

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
				// Load profile aggregate (user + counts + isFollowing)
				const res = await API.get(`/users/${id}/profile`);
				const data = normalizeProfileResponse(res?.data);
				const u = data?.user ?? data?.profile ?? data?.data?.user;
				if (!ignore) setProfile(u || null);
				if (!ignore) {
					setFollowersCount(Number(data?.counts?.followers ?? 0));
					setFollowingCount(Number(data?.counts?.following ?? 0));
					setPostsCount(Number(data?.counts?.posts ?? 0));
					setIsFollowing(Boolean(data?.isFollowing));
				}

				// Load user's posts (for empty state + navigation)
				setPostsLoading(true);
				try {
					const postsRes = await API.get(`/posts/user/${id}`);
					const body = postsRes?.data?.data ?? postsRes?.data;
					const list = Array.isArray(body?.posts) ? body.posts : Array.isArray(body) ? body : [];
					if (!ignore) setPosts(list);
				} catch {
					if (!ignore) setPosts([]);
					showToast('Failed to load posts', 'error');
				} finally {
					if (!ignore) setPostsLoading(false);
				}
			} catch (e) {
				const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load profile';
				if (!ignore) {
					setError(msg);
					setProfile(null);
					setPosts([]);
				}
				showToast(msg, 'error');
			} finally {
				if (!ignore) setLoading(false);
			}
		};

		load();
		return () => {
			ignore = true;
		};
	}, [id, currentUser?._id, showToast]);

	const onToggleFollow = async () => {
		if (!profile?._id) return;
		if (buttonLoading) return;
		setButtonLoading(true);

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
				showToast('Unfollowed', 'success');
			} else {
				const resp = await followUser(profile._id);
				if (resp?.followersCount !== undefined) setFollowersCount(Number(resp.followersCount));
				showToast('Following', 'success');
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
		return (
			<div className="container-app page-section max-w-3xl">
				<Card className="p-6">
					<div className="flex items-center gap-4">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-6 w-1/2" />
							<Skeleton className="h-4 w-1/3" />
						</div>
					</div>
					<div className="mt-4 grid grid-cols-3 gap-4">
						<Skeleton className="h-16 rounded-2xl" />
						<Skeleton className="h-16 rounded-2xl" />
						<Skeleton className="h-16 rounded-2xl" />
					</div>
					<Loader label="Loading profile…" />
				</Card>
			</div>
		);
	}

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
						title={profile?.name || profile?.username || 'Profile'}
						subtitle={profile?.username ? `@${profile.username}` : profile?.role ? `Role: ${profile.role}` : undefined}
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

					<div className="mt-4 flex items-center gap-4">
						<div className="h-16 w-16 rounded-full overflow-hidden border border-soft dark:border-white/10 bg-soft/60 dark:bg-white/10">
							<SafeImage
								src={profile?.avatar || ''}
								alt={profile?.name || 'User avatar'}
								className="h-full w-full object-cover"
								fallback="/images/placeholder.svg"
							/>
						</div>
						<div className="min-w-0">
							<div className="text-sm text-charcoal/70 dark:text-sand/70">
								{profile?.role === 'creator' ? 'Creator' : profile?.role || 'User'}
							</div>
							{profile?.bio ? (
								<div className="mt-1 text-sm text-charcoal/80 dark:text-sand/80 leading-relaxed">
									{profile.bio}
								</div>
							) : null}
						</div>
					</div>

					<div className="mt-4 grid grid-cols-3 gap-4 text-center">
						<div className="rounded-2xl border border-soft dark:border-white/10 p-4">
							<div className="text-xs text-charcoal/60 dark:text-sand/60">Followers</div>
							<div className="text-2xl font-bold">{followersCount}</div>
						</div>
						<div className="rounded-2xl border border-soft dark:border-white/10 p-4">
							<div className="text-xs text-charcoal/60 dark:text-sand/60">Following</div>
							<div className="text-2xl font-bold">{followingCount}</div>
						</div>
						<div className="rounded-2xl border border-soft dark:border-white/10 p-4">
							<div className="text-xs text-charcoal/60 dark:text-sand/60">Posts</div>
							<div className="text-2xl font-bold">{postsCount}</div>
						</div>
					</div>
				</Card>
			)}

			{profile && (
				<div className="mt-6">
					<SectionHeader title="Posts" />

					{postsLoading ? (
						<Card className="p-6 mt-3">
							<div className="space-y-3">
								<Skeleton className="h-6 w-2/3" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-64 w-full rounded-2xl" />
							</div>
							<Loader label="Loading posts…" />
						</Card>
					) : posts.length === 0 ? (
						<div className="mt-3">
							<EmptyState title="No posts yet" description="This user hasn’t shared any stories yet." />
						</div>
					) : (
						<div className="mt-3 space-y-4">
							{posts.map((post) => (
								<Card key={post._id} className="p-6 bg-white/70 dark:bg-[#0F1F1A]/70 backdrop-blur-md">
									<div className="flex justify-between items-start mb-2 gap-3">
										<h3 className="text-lg font-heading font-bold tracking-tight text-mountain dark:text-sand">
											{post.title || String(post.content || '').slice(0, 48) || 'Post'}
										</h3>
										<span className="bg-adventure/10 text-adventure text-xs px-2 py-1 rounded-full shrink-0">
											📍 {post.location}
										</span>
									</div>
									{post.imageUrl ? (
										<div className="mb-3">
											<LuxImage
												src={post.imageUrl}
												alt={post.title || 'Post image'}
												className="w-full h-64 rounded-2xl"
												transform="w-1100,h-850"
											/>
										</div>
									) : null}
									<p className="text-charcoal/80 dark:text-sand/80 leading-relaxed">{post.content}</p>
								</Card>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
