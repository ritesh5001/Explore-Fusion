import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-blue-600">
        Explore Fusion 🌍
      </Link>

      {/* Links */}
      <div className="space-x-6 font-medium">
        <Link to="/" className="hover:text-blue-500">Feed</Link>
        <Link to="/plan-trip" className="hover:text-blue-500">AI Planner</Link>
        <Link to="/bookings" className="hover:text-blue-500">My Trips</Link>
        <Link to="/buddy" className="hover:text-blue-500">Buddy Finder</Link>
        <Link to="/packages" className="hover:text-blue-500">Packages</Link>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/profile" className="text-gray-800 font-bold hover:text-blue-600">
  👤 {user.name}
</Link>
            <button 
              onClick={handleLogout} 
              className="text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;