import { useEffect, useState } from 'react';
import API from '../api';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';


const Home = () => {
  const [posts, setPosts] = useState([]);
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
				  <a href="/login" className="btn-outline bg-white text-mountain px-8 py-3 rounded-xl shadow-md hover:shadow-lg">
            Get Started
          </a>
				  <a href="/packages" className="btn-outline border-white text-white hover:bg-white hover:text-mountain px-8 py-3 rounded-xl">
            Browse Trips
          </a>
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
    try {
      const res = await API.get('/posts');
      const body = res?.data;
      const postsList = body?.data?.posts ?? body?.posts ?? body;
      setPosts(Array.isArray(postsList) ? postsList : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
		showToast('Failed to load posts', 'error');
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
        
        <div className="glass-card p-6 rounded-2xl shadow-sm mb-8">
			<div className="text-lg font-heading font-bold tracking-tight text-mountain mb-4">Share your journey</div>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input 
              type="text" placeholder="Trip Title (e.g., Weekend in Manali)" 
              className="w-full border border-soft p-3 rounded-xl bg-white/70"
              value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            />
            <textarea 
              placeholder="Share your experience..." 
              className="w-full border border-soft p-3 rounded-xl h-24 bg-white/70"
              value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            />
            <input 
              type="text" placeholder="Location" 
              className="w-full border border-soft p-3 rounded-xl bg-white/70"
              value={newPost.location} onChange={(e) => setNewPost({...newPost, location: e.target.value})}
            />
            <button className="btn-primary w-full">
              Post Trip
            </button>
          </form>
        </div>

        <h3 className="text-xl font-heading font-bold tracking-tight text-mountain mb-4">Recent Stories</h3>
        <div className="space-y-6">
          {(Array.isArray(posts) ? posts : []).map((post) => (
            <div key={post._id} className="glass-card p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-heading font-bold tracking-tight text-mountain">{post.title}</h2>
                <span className="bg-adventure/10 text-adventure text-xs px-2 py-1 rounded-full">
                  📍 {post.location}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">{post.content}</p>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              No posts yet. Start the trend! 🚀
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;