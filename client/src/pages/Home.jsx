import { useEffect, useState } from 'react';
import API from '../api';
import Navbar from '../components/Navbar'; 


const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', location: '' });
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <h1 className="text-5xl font-bold mb-6">Explore the World with AI 🌍</h1>
        <p className="text-xl mb-8 max-w-2xl">
          Plan trips in seconds, find travel buddies, and book exclusive influencer packages.
        </p>
        <div className="space-x-4">
          <a href="/login" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
            Get Started
          </a>
          <a href="/packages" className="border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 transition">
            Browse Trips
          </a>
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
      const { data } = await API.get('/posts');
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await API.post('/posts', newPost);
      setNewPost({ title: '', content: '', location: '' }); 
      fetchPosts(); 
    } catch (error) {
      alert('Failed to create post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> {/* <--- Add Navbar here */}

      <div className="max-w-2xl mx-auto py-8 px-4">
        
        {/* Create Post Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-bold mb-4">Share your journey ✈️</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input 
              type="text" placeholder="Trip Title (e.g., Weekend in Manali)" 
              className="w-full border p-2 rounded"
              value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            />
            <textarea 
              placeholder="Share your experience..." 
              className="w-full border p-2 rounded h-24"
              value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            />
            <input 
              type="text" placeholder="Location" 
              className="w-full border p-2 rounded"
              value={newPost.location} onChange={(e) => setNewPost({...newPost, location: e.target.value})}
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full">
              Post Trip
            </button>
          </form>
        </div>

        {/* Post Feed */}
        <h3 className="text-xl font-bold mb-4">Recent Stories</h3>
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-800">{post.title}</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
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