import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-soft">
      <div className="container-app py-3 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-heading font-extrabold tracking-tight text-mountain hover:text-forest transition">
          Explore <span className="text-forest">Fusion</span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-charcoal hover:text-trail transition font-semibold">
                Dashboard
              </Link>
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <Link to="/admin/dashboard" className="text-charcoal hover:text-trail transition font-semibold">
                  Admin
                </Link>
              )}
              <Link to="/packages" className="text-charcoal hover:text-trail transition font-semibold">
                Packages
              </Link>
              <Link to="/my-bookings" className="text-charcoal hover:text-trail transition font-semibold">
                My Bookings
              </Link>
              <Link to="/buddy/profile" className="text-charcoal hover:text-trail transition font-semibold">
                Buddy
              </Link>
              <Link to="/chat" className="text-charcoal hover:text-trail transition font-semibold">
                Chat
              </Link>
              <Link to="/ai/chat" className="text-charcoal hover:text-trail transition font-semibold">
                AI Chat
              </Link>
              <Link to="/ai/itinerary" className="text-charcoal hover:text-trail transition font-semibold">
                AI Itinerary
              </Link>
              <Link to="/my-itineraries" className="text-charcoal hover:text-trail transition font-semibold">
                My Itineraries
              </Link>
              <Link to="/notifications" className="text-charcoal hover:text-trail transition font-semibold">
                Notifications
              </Link>
              <Link to="/profile" className="text-charcoal hover:text-trail transition font-semibold">
                Profile
              </Link>
              <span className="text-mountain font-semibold">{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="text-red-700 hover:text-red-900 font-semibold transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/packages" className="text-charcoal hover:text-trail transition font-semibold">
                Packages
              </Link>
              <Link to="/login" className="text-charcoal hover:text-trail transition font-semibold">
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;