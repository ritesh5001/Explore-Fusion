import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import useAuth from '../auth/useAuth';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const links = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { to: '/packages', label: 'Packages' },
        { to: '/login', label: 'Login' },
      ];
    }

    const authed = [
      { to: '/dashboard', label: 'Dashboard' },
      ...(user?.role === 'admin' || user?.role === 'superadmin' ? [{ to: '/admin/dashboard', label: 'Admin' }] : []),
      { to: '/packages', label: 'Packages' },
      { to: '/my-bookings', label: 'My Bookings' },
      { to: '/buddy/profile', label: 'Buddy' },
      { to: '/chat', label: 'Chat' },
      { to: '/ai/chat', label: 'AI Chat' },
      { to: '/ai/itinerary', label: 'AI Itinerary' },
      { to: '/my-itineraries', label: 'My Itineraries' },
      { to: '/notifications', label: 'Notifications' },
      { to: '/profile', label: 'Profile' },
    ];

    return authed;
  }, [isAuthenticated, user?.role]);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-[#0F1F1A]/70 backdrop-blur-md border-b border-soft dark:border-white/10">
      <div className="container-app py-3 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="text-xl font-heading font-extrabold tracking-tight text-mountain dark:text-sand hover:text-forest transition"
        >
          Explore <span className="text-forest">Fusion</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="hidden sm:inline-flex"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-soft dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-charcoal dark:text-sand"
            aria-label="Open menu"
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((v) => !v)}
          >
            <span className="text-lg leading-none">☰</span>
          </button>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="container-app pb-3 flex items-center justify-end gap-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-charcoal dark:text-sand hover:text-trail transition font-semibold">
              {l.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          ) : (
            <>
              <span className="text-mountain dark:text-sand font-semibold">{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="text-red-700 dark:text-red-300 hover:text-red-900 font-semibold transition">
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {isMobileOpen && (
        <div className="md:hidden border-t border-soft dark:border-white/10 bg-white/80 dark:bg-[#0F1F1A]/80 backdrop-blur-md">
          <div className="container-app py-3 flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={toggleTheme} className="justify-center">
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </Button>

            <div className="h-px bg-soft dark:bg-white/10 my-1" />

            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-xl px-3 py-2 font-semibold text-charcoal dark:text-sand hover:bg-soft/60 dark:hover:bg-white/5 transition"
              >
                {l.label}
              </Link>
            ))}

            {!isAuthenticated ? (
              <Link to="/register" className="btn-primary text-center">
                Register
              </Link>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-mountain dark:text-sand font-semibold truncate">{user?.name || 'User'}</span>
                  <button onClick={handleLogout} className="text-red-700 dark:text-red-300 hover:text-red-900 font-semibold transition">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;