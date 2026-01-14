import { useState } from 'react';
import API from '../api';
import { useToast } from '../components/ToastProvider';

const BuddyMatcher = () => {
  const [formData, setFormData] = useState({ destination: '', interests: '', travelStyle: '' });
  const [buddy, setBuddy] = useState(null);
  const [loading, setLoading] = useState(false);
	const { showToast } = useToast();

  const handleMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/ai/match', formData);
      setBuddy(data.buddy);
    } catch {
		showToast('Failed to find a match', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">❤️ AI Travel Buddy Finder</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Who are you?</h2>
            <form onSubmit={handleMatch} className="space-y-4">
              <input 
                className="w-full border p-2 rounded" 
                placeholder="Where are you going?"
                value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})}
              />
              <textarea 
                className="w-full border p-2 rounded" 
                placeholder="Your Interests (e.g. Photography, Food, History)"
                value={formData.interests} onChange={e => setFormData({...formData, interests: e.target.value})}
              />
              <select 
                className="w-full border p-2 rounded"
                value={formData.travelStyle} onChange={e => setFormData({...formData, travelStyle: e.target.value})}
              >
                <option value="">Select Travel Style</option>
                <option value="Budget Backpacker">Budget Backpacker 🎒</option>
                <option value="Luxury Traveler">Luxury Traveler 💎</option>
                <option value="Adventure Seeker">Adventure Seeker 🧗</option>
              </select>
              
              <button disabled={loading} className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 font-bold">
                {loading ? 'Finding Match...' : '💘 Find My Buddy'}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center">
            {buddy ? (
              <div className="bg-white p-6 rounded-xl shadow-xl border-2 border-pink-200 w-full transform hover:scale-105 transition-transform">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-pink-100 rounded-full mx-auto flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <h2 className="text-2xl font-bold mt-2">{buddy.name}, {buddy.age}</h2>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                    {buddy.compatibility_score} Match
                  </span>
                </div>
                
                <p className="text-gray-600 italic text-center mb-4">"{buddy.bio}"</p>
                
                <div className="space-y-2 text-sm">
                  <p><strong>✨ Shared Interests:</strong> {buddy.shared_interests.join(', ')}</p>
                  <p><strong>💡 Why:</strong> {buddy.reason}</p>
                </div>

                <button className="mt-6 w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">
                  Send Message
                </button>
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <p>Fill the form to find your travel partner!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BuddyMatcher;