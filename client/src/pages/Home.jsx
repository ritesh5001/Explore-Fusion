import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import Loader, { Skeleton } from '../components/ui/Loader';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import LuxImage from '../components/ui/LuxImage';
import { uploadPostImage } from '../utils/imagekit';


const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState({ content: '', location: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState('');
  const { user } = useAuth();
	const { showToast } = useToast();
  
  const hero = (
    <div className="gradient-header">
      <div className="container-app py-12">
        <div className="flex flex-col items-start justify-center gap-6">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-white">
            Explore Fusion
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Plan trips in seconds, find travel buddies, and book exclusive creator packages.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button as={Link} to="/packages" size="lg" className="w-full sm:w-auto">
              Explore Trips
            </Button>
            {user ? (
              <Button as={Link} to="/dashboard" variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-mountain">
                Go to Dashboard
              </Button>
            ) : (
              <Button as={Link} to="/login" variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-mountain">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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
          imageFolder: uploaded.folder,
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

  const featureCards = (
    <div className="container-app py-10">
      <SectionHeader title="What you can do" subtitle="A travel stack built for speed, community, and control." />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-2xl">🧠</div>
          <div className="mt-3 font-heading font-bold text-mountain dark:text-sand">AI Itineraries</div>
          <div className="mt-1 text-sm text-charcoal/70 dark:text-sand/70">Generate day-by-day plans in seconds.</div>
          <div className="mt-4">
            <Button as={Link} to="/ai/itinerary" variant="outline" size="sm">Try It</Button>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl">🤝</div>
          <div className="mt-3 font-heading font-bold text-mountain dark:text-sand">Buddy Matching</div>
          <div className="mt-1 text-sm text-charcoal/70 dark:text-sand/70">Find travel partners for your vibe.</div>
          <div className="mt-4">
            <Button as={Link} to="/buddy" variant="outline" size="sm">Find Buddies</Button>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl">💬</div>
          <div className="mt-3 font-heading font-bold text-mountain dark:text-sand">Real-time Chat</div>
          <div className="mt-1 text-sm text-charcoal/70 dark:text-sand/70">Coordinate plans and meetups live.</div>
          <div className="mt-4">
            <Button as={Link} to="/chat" variant="outline" size="sm">Open Chat</Button>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
    {hero}
    {featureCards}

    {user ? (
      <div className="container-app pb-12 max-w-2xl">
        <SectionHeader
          title="Share your journey"
          subtitle="Post a quick story from your latest trip."
        />

        <Card className="mt-4 p-6 bg-white/70 dark:bg-[#0F1F1A]/70 backdrop-blur-md">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea
              label="Your story"
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
              <label className="block text-sm font-semibold text-mountain dark:text-sand">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-charcoal/80 file:mr-3 file:rounded-xl file:border-0 file:bg-trail/15 file:px-4 file:py-2 file:text-mountain file:font-semibold hover:file:bg-trail/25 dark:text-sand/80"
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

            <Button type="submit" className="w-full" disabled={uploading || !newPost.content.trim() || !newPost.location.trim()}>
              {uploading ? 'Uploading…' : selectedFile ? 'Post with image' : 'Post'}
            </Button>
          </form>
        </Card>

        <div className="mt-10">
          <SectionHeader title="Recent Stories" subtitle="What the community is sharing right now." />
        </div>

        <div className="space-y-6">
          {loadingPosts && (
            <Card className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Loader label="Loading stories…" />
            </Card>
          )}

          {(Array.isArray(posts) ? posts : []).map((post) => (
            <Card key={post._id} className="p-6 bg-white/70 dark:bg-[#0F1F1A]/70 backdrop-blur-md">
              <div className="flex justify-between items-start mb-2 gap-3">
                <h2 className="text-xl font-heading font-bold tracking-tight text-mountain dark:text-sand">
                  {post.title || String(post.content || '').slice(0, 48) || 'Post'}
                </h2>
                <span className="bg-adventure/10 text-adventure text-xs px-2 py-1 rounded-full shrink-0">
                  📍 {post.location}
                </span>
              </div>
              {post.imageUrl ? (
                <div className="mb-3">
                  <LuxImage src={post.imageUrl} alt={post.title || 'Post image'} className="w-full h-64 rounded-2xl" transform="w-1100,h-850" />
                </div>
              ) : null}
              <p className="text-charcoal/80 dark:text-sand/80 leading-relaxed">{post.content}</p>
            </Card>
          ))}

          {!loadingPosts && posts.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-charcoal/70 dark:text-sand/70">No posts yet. Start the trend!</div>
            </Card>
          )}
        </div>
      </div>
    ) : (
      <div className="container-app pb-12">
        <Card className="p-8 text-center">
          <div className="text-charcoal/70 dark:text-sand/70">
            Sign in to share stories and save your trips.
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button as={Link} to="/register" size="sm">Create account</Button>
            <Button as={Link} to="/login" variant="outline" size="sm">Sign in</Button>
          </div>
        </Card>
      </div>
    )}
    </div>
  );
};

export default Home;