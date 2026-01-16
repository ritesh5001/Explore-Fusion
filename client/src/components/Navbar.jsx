import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import useAuth from '../auth/useAuth';
import Button from './ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import SafeImage from './common/SafeImage';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const LOGO_URL = import.meta.env.VITE_BRAND_LOGO_URL || '/branding/logo.png';

  const handleLogout = () => {
    setIsMobileOpen(false);
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
    <nav className="sticky top-0 z-50 border-b border-border bg-sand/80 backdrop-blur-sm">
      <div className="container-app py-3 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-heading font-medium tracking-[0.04em] text-charcoal hover:text-gold transition"
        >
      <SafeImage
        src={LOGO_URL}
        fallback="/images/placeholder.svg"
        alt="Explore Fusion"
        className="h-8 w-8 rounded-xl object-contain bg-white"
        loading="eager"
        decoding="async"
      />
          Explore <span className="text-gold">Fusion</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-2xl border border-border bg-white px-3 py-2 text-charcoal"
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
            <Link key={l.to} to={l.to} className="text-charcoal/70 hover:text-gold transition font-medium">
              {l.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <Button as={Link} to="/register" size="sm">
              Register
            </Button>
          ) : (
            <>
              <span className="text-charcoal font-medium">{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="text-red-700 hover:text-red-900 font-medium transition">
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <MotionButton
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-black/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <MotionDiv
              className="md:hidden fixed top-0 right-0 z-50 h-dvh w-[86vw] max-w-sm border-l border-border bg-paper/90 backdrop-blur-xl"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="font-heading font-medium tracking-[0.04em] text-charcoal">Menu</div>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileOpen(false)} aria-label="Close">
                  ✕
                </Button>
              </div>

              <div className="px-4 pb-4">
                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setIsMobileOpen(false)}
                      className="rounded-2xl px-3 py-2 font-medium text-charcoal/85 hover:bg-black/5 transition"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-border my-4" />

                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button as={Link} to="/login" variant="secondary" size="sm" className="w-full" onClick={() => setIsMobileOpen(false)}>
                      Sign in
                    </Button>
                    <Button as={Link} to="/register" size="sm" className="w-full" onClick={() => setIsMobileOpen(false)}>
                      Register
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                  <span className="text-charcoal font-medium truncate">{user?.name || 'User'}</span>
                    <Button variant="danger" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;