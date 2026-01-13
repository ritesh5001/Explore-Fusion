import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import Loader, { Skeleton } from '../components/ui/Loader';


const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '', location: '' });
  const { user } = useAuth();
	const { showToast } = useToast();
  
  if (!user) {
  return (
    <div className="min-h-screen gradient-header">
      <div className="container-app page-section">
			<div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
				<h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-white mb-6">Explore the World with AI</h1>
        <p className="text-xl mb-8 max-w-2xl">
          Plan trips in seconds, find travel buddies, and book exclusive influencer packages.
        </p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            as={Link}
            to="/login"
            variant="outline"
            size="lg"
            className="bg-white text-mountain border-white"
          >
            Get Started
          </Button>
          <Button
            as={Link}
            to="/packages"
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-mountain"
          >
            Browse Trips
          </Button>
        </div>
      </div>
		</div>
    </div>
  );
}


  useEffect(() => {
    fetchPosts();
  }, []);
  const fetchPosts = async () => {
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
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await API.post('/posts', newPost);
      setNewPost({ title: '', content: '', location: '' }); 
      fetchPosts(); 
    } catch (error) {
		showToast('Failed to create post', 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-app page-section max-w-2xl">

			<SectionHeader
				title="Share your journey"
				subtitle="Post a quick story from your latest trip."
			/>

			<Card className="mt-4 p-6 bg-white/70 dark:bg-[#0F1F1A]/70 backdrop-blur-md">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input 
              type="text" placeholder="Trip Title (e.g., Weekend in Manali)" 
              className="w-full border border-soft dark:border-white/10 p-3 rounded-xl bg-white/70 dark:bg-white/5 text-charcoal dark:text-sand placeholder:text-charcoal/50 dark:placeholder:text-sand/40"
              value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            />
            <textarea 
              placeholder="Share your experience..." 
              className="w-full border border-soft dark:border-white/10 p-3 rounded-xl h-24 bg-white/70 dark:bg-white/5 text-charcoal dark:text-sand placeholder:text-charcoal/50 dark:placeholder:text-sand/40"
              value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            />
            <input 
              type="text" placeholder="Location" 
              className="w-full border border-soft dark:border-white/10 p-3 rounded-xl bg-white/70 dark:bg-white/5 text-charcoal dark:text-sand placeholder:text-charcoal/50 dark:placeholder:text-sand/40"
              value={newPost.location} onChange={(e) => setNewPost({...newPost, location: e.target.value})}
            />
					<Button type="submit" className="w-full">Post Trip</Button>
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
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-heading font-bold tracking-tight text-mountain">{post.title}</h2>
                <span className="bg-adventure/10 text-adventure text-xs px-2 py-1 rounded-full">
                  📍 {post.location}
                </span>
              </div>
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
    </div>
  );
};

export default Home;