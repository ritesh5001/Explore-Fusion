import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader, { Skeleton } from '../components/ui/Loader';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { uploadPostImage } from '../utils/imagekit';
import { useReveal } from '../hooks/useReveal';
import {
  BuddyProfileCard,
  HomeSectionHeader,
  HorizontalScroller,
  LuxuryPostCard,
} from '../components/home';


const Home = () => {
	const heroRevealRef = useReveal();
	const buddyRevealRef = useReveal();
	const postFormRevealRef = useReveal();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState({ content: '', location: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState('');
	const [buddySuggestions, setBuddySuggestions] = useState([]);
	const [loadingBuddies, setLoadingBuddies] = useState(false);
	const [buddyError, setBuddyError] = useState('');
  const { user } = useAuth();
	const { showToast } = useToast();

	const featuredPosts = useMemo(() => {
		const list = Array.isArray(posts) ? posts : [];
		// Hero should feel visual-first. Prefer posts that have images.
		const withImages = list.filter((p) => p?.imageUrl);
		return (withImages.length ? withImages : list).slice(0, 10);
	}, [posts]);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await API.get('/posts');
      const body = res?.data;
      const postsList = body?.data?.posts ?? body?.posts ?? body;
      setPosts(Array.isArray(postsList) ? postsList : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
		showToast('Failed to load posts', 'error');
    } finally {
      setLoadingPosts(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadBuddySuggestions = useCallback(async () => {
    if (!user) {
      setBuddySuggestions([]);
      return;
    }
    setBuddyError('');
    setLoadingBuddies(true);
    try {
      const res = await API.get('/matches/suggestions');
      const data = res?.data?.data ?? res?.data;
      const list = Array.isArray(data?.suggestions)
        ? data.suggestions
        : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data)
            ? data
            : [];
      setBuddySuggestions(list);
    } catch (e) {
      setBuddySuggestions([]);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load suggestions';
      setBuddyError(msg + (status ? ` (HTTP ${status})` : ''));
    } finally {
      setLoadingBuddies(false);
    }
  }, [user]);

  useEffect(() => {
    loadBuddySuggestions();
  }, [loadBuddySuggestions]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {
        // noop
      }
    };
  }, [previewUrl]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (uploading) return;
    try {
    // 1) Create post (content + location required)
    const createRes = await API.post('/posts', {
      content: newPost.content,
      location: newPost.location,
    });
    const created = createRes?.data?.data ?? createRes?.data;
    const postId = created?._id;

    // 2) If image selected, upload it to ImageKit under a post-specific folder, then attach it to the post
    if (selectedFile && postId) {
      setUploading(true);
      try {
        const uploaded = await uploadPostImage({
          file: selectedFile,
          postId,
          postedBy: user,
          location: newPost.location,
        });
        await API.put(`/posts/${postId}`, {
          imageUrl: uploaded.url,
          imageFileId: uploaded.fileId,
        });
      } finally {
        setUploading(false);
      }
    }

    setNewPost({ content: '', location: '', imageUrl: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    fetchPosts();
	} catch {
		showToast('Failed to create post', 'error');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch {
      setPreviewUrl('');
    }
  };

  const clearSelectedImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {
        // noop
      }
    }
    setPreviewUrl('');
  };

  return (
    <div className="min-h-screen">
		{/* HERO: Recent posts (visual-first) */}
		<section ref={heroRevealRef} data-reveal className="px-4 sm:px-6 lg:px-10 pt-12 pb-16">
			<div className="flex items-start justify-between gap-8">
				<div className="min-w-0">
					<h1 className="text-[34px] sm:text-[46px] leading-[1.05] font-heading font-normal tracking-[0.02em] text-charcoal">
						Explore Fusion
					</h1>
					<p className="mt-5 text-base sm:text-lg text-muted max-w-2xl">
						A calm, premium travel space for stories, companions, and curated experiences.
					</p>
				</div>
				<div className="hidden sm:flex items-center gap-2 shrink-0">
						<div style={{ ['--reveal-delay']: '80ms' }}>
							<Button as={Link} to="/packages" variant="outline" size="sm">
								Explore trips
							</Button>
						</div>
					{user ? (
							<div style={{ ['--reveal-delay']: '160ms' }}>
								<Button as={Link} to="/dashboard" variant="primary" size="sm">
									Dashboard
								</Button>
							</div>
					) : (
							<div style={{ ['--reveal-delay']: '160ms' }}>
								<Button as={Link} to="/login" variant="primary" size="sm">
									Sign in
								</Button>
							</div>
					)}
				</div>
			</div>

			<div className="mt-10">
				<HomeSectionHeader
					title="Recent posts"
					subtitle="A quiet feed of moments shared by travelers."
					right={
						<div className="hidden sm:block text-[11px] tracking-[0.18em] uppercase text-muted">
							Drag · Swipe · Slow scroll
						</div>
					}
				/>
			</div>

			<div className="mt-6">
				{loadingPosts ? (
					<div className="rounded-[26px] border border-border bg-card p-6 shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
						<div className="space-y-3">
							<Skeleton className="h-5 w-1/3" />
							<Skeleton className="h-4 w-1/2" />
						</div>
						<div className="mt-4">
							<Loader label="Loading posts…" />
						</div>
					</div>
				) : featuredPosts.length ? (
					<HorizontalScroller
						items={featuredPosts}
						speed={12}
						ariaLabel="Recent posts"
						className="-mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10"
						renderItem={(post, idx) => (
							<LuxuryPostCard
								post={post}
								revealDelayMs={(idx + 1) * 80}
							/>
						)}
					/>
				) : (
					<div className="rounded-[26px] border border-border bg-card p-8 text-muted shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
						No posts yet.
					</div>
				)}
			</div>
		</section>

		{/* Buddy match finder */}
		<section ref={buddyRevealRef} data-reveal className="px-4 sm:px-6 lg:px-10 py-16 border-t border-border bg-paper">
			<HomeSectionHeader
				title="Buddy match finder"
				subtitle="People you might genuinely enjoy traveling with."
				right={
					user ? (
						<Button variant="link" size="sm" onClick={loadBuddySuggestions} aria-label="Refresh buddy suggestions">
							Refresh
						</Button>
					) : (
						<Button as={Link} to="/login" variant="link" size="sm">
							Sign in
						</Button>
					)
				}
			/>

			<div className="mt-6">
				{!user ? (
					<div className="rounded-[26px] border border-border bg-card p-8 shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
						<p className="text-muted">Sign in to see personalized buddy suggestions.</p>
						<div className="mt-4 flex items-center gap-2">
							<Button as={Link} to="/login" variant="primary" size="sm">
								Sign in
							</Button>
							<Button as={Link} to="/register" variant="outline" size="sm">
								Create account
							</Button>
						</div>
					</div>
				) : loadingBuddies ? (
					<div className="rounded-[26px] border border-border bg-card p-6 shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
						<Loader label="Finding companions…" />
					</div>
				) : buddyError ? (
					<div className="rounded-[26px] border border-border bg-card p-6 text-muted shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
						<div className="text-sm">{buddyError}</div>
						<div className="mt-3">
							<Button variant="outline" size="sm" onClick={loadBuddySuggestions}>
								Try again
							</Button>
						</div>
					</div>
				) : (Array.isArray(buddySuggestions) ? buddySuggestions : []).length ? (
					<HorizontalScroller
						items={buddySuggestions.slice(0, 12)}
						speed={8}
						ariaLabel="Buddy suggestions"
						className="-mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10"
						renderItem={(u, idx) => <BuddyProfileCard user={u} revealDelayMs={(idx + 1) * 80} />}
					/>
				) : (
					<div className="rounded-[26px] border border-border bg-card p-8 text-muted shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
						No suggestions right now. Add your buddy profile to improve matching.
						<div className="mt-4">
							<Button as={Link} to="/buddy" variant="outline" size="sm">
								Open buddy finder
							</Button>
						</div>
					</div>
				)}
			</div>
		</section>

		{/* Optional: Create a post (kept functional; calmer styling) */}
		{user ? (
			<section ref={postFormRevealRef} data-reveal className="px-4 sm:px-6 lg:px-10 pb-16 border-t border-border">
				<div className="pt-14">
					<HomeSectionHeader
						title="Share a moment"
						subtitle="A short note from your latest journey."
					/>
				</div>

				<div className="mt-6 max-w-3xl">
					<Card className="p-6 bg-white/55 border border-soft/80 shadow-none">
						<form onSubmit={handleCreatePost} className="space-y-4">
							<Textarea
								label="Story"
								aria-label="Trip story"
								value={newPost.content}
								onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
								className="min-h-28"
							/>
							<Input
								label="Location"
								aria-label="Trip location"
								value={newPost.location}
								onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
							/>

							<div className="space-y-2">
								<label className="block text-xs tracking-wide text-charcoal/70">Image (optional)</label>
								<input
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									disabled={uploading}
									className="block w-full text-sm text-charcoal/70 file:mr-3 file:rounded-xl file:border file:border-soft file:bg-sand file:px-4 file:py-2 file:text-charcoal/80 file:font-medium hover:file:bg-white/70"
								/>
								{previewUrl ? (
									<div className="mt-2">
										<img
											src={previewUrl}
											alt="Post image preview"
											className="w-full h-56 rounded-2xl object-cover"
										/>
										<div className="mt-2 flex justify-end">
											<Button type="button" size="sm" variant="outline" onClick={clearSelectedImage}>
												Remove image
											</Button>
										</div>
									</div>
								) : null}
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={uploading || !newPost.content.trim() || !newPost.location.trim()}
							>
								{uploading ? 'Uploading…' : selectedFile ? 'Post with image' : 'Post'}
							</Button>
						</form>
					</Card>
				</div>
			</section>
		) : null}
    </div>
  );
};

export default Home;