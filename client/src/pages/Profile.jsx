import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In 🔒</h2>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl">
            👤
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase">
              Member
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/bookings')}>
            <div className="text-4xl mb-4">✈️</div>
            <h2 className="text-xl font-bold mb-2">My Travels</h2>
            <p className="text-gray-600 mb-4">View your saved AI itineraries and booked packages.</p>
            <span className="text-blue-600 font-bold hover:underline">Go to My Trips &rarr;</span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-purple-500" onClick={() => navigate('/creator')}>
            <div className="text-4xl mb-4">📈</div>
            <h2 className="text-xl font-bold mb-2">Creator Dashboard</h2>
            <p className="text-gray-600 mb-4">Track your sales and revenue from published packages.</p>
            <span className="text-purple-600 font-bold hover:underline">View Sales &rarr;</span>
          </div>

           <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/create-package')}>
            <div className="text-4xl mb-4">💎</div>
            <h2 className="text-xl font-bold mb-2">Sell a Trip</h2>
            <p className="text-gray-600 mb-4">Become an influencer! Create a travel package to sell.</p>
            <span className="text-green-600 font-bold hover:underline">Create Package &rarr;</span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer bg-red-50" onClick={handleLogout}>
            <div className="text-4xl mb-4">🚪</div>
            <h2 className="text-xl font-bold mb-2 text-red-700">Logout</h2>
            <p className="text-red-600 mb-4">Sign out of your account securely.</p>
            <span className="text-red-700 font-bold hover:underline">Log Out Now &rarr;</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;