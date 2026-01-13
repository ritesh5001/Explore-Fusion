import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';

const CreatePackage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    location: '',
    duration: '',
    image: '' // We will just use a URL for now
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      alert("Please login to create a package");
      return;
    }

    try {
      await API.post('/packages', {
        ...formData,
        creator_id: user._id // Link the package to the logged-in user
      });
      alert('Package Created Successfully! 🎉');
      navigate('/packages'); // Redirect to the marketplace
    } catch (error) {
      console.error('Create package failed:', error);
      const message =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.message ||
        'Failed to create package';
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">💎 Create Influencer Trip</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          
          <div>
            <label className="block text-gray-700 font-bold mb-1">Trip Title</label>
            <input 
              required
              className="w-full border p-2 rounded" 
              placeholder="e.g. Bali Yoga Retreat"
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Price ($)</label>
              <input 
                required type="number"
                className="w-full border p-2 rounded" 
                placeholder="500"
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Duration</label>
              <input 
                required
                className="w-full border p-2 rounded" 
                placeholder="e.g. 5 Days"
                value={formData.duration} 
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Location</label>
            <input 
              required
              className="w-full border p-2 rounded" 
              placeholder="e.g. Ubud, Bali"
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Image URL</label>
            <input 
              required
              className="w-full border p-2 rounded" 
              placeholder="https://example.com/image.jpg"
              value={formData.image} 
              onChange={e => setFormData({...formData, image: e.target.value})}
            />
            <p className="text-xs text-gray-400 mt-1">Tip: Search Google Images, right click, "Copy Image Address"</p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Description</label>
            <textarea 
              required
              className="w-full border p-2 rounded h-32" 
              placeholder="Describe the experience..."
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button className="w-full bg-purple-600 text-white font-bold py-3 rounded hover:bg-purple-700 transition">
            🚀 Launch Trip
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreatePackage;