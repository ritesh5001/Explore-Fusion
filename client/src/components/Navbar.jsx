import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import useAuth from '../auth/useAuth';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';
import { AnimatePresence, motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const defaultRemoteLogo = 'https://ik.imagekit.io/Ritesh5001/explore-fusion/branding/logo.png';
  const logoSrc = import.meta.env.VITE_BRAND_LOGO_URL || defaultRemoteLogo;
  const logoFallbackTriedRef = useRef(false);

  const handleLogoError = (e) => {
    const img = e.currentTarget;
    // Avoid setState loops: mutate DOM src once, then hide if even fallback fails.
    if (!logoFallbackTriedRef.current) {
      logoFallbackTriedRef.current = true;
      img.onerror = null;
      img.src = '/branding/logo.png';
      return;
    }
    img.onerror = null;
    img.style.display = 'none';
  };

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
    <nav className="sticky top-0 z-50 border-b border-soft/80 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md">
      <div className="container-app py-3 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-heading font-extrabold tracking-tight text-mountain dark:text-sand hover:text-trail transition"
        >
			<img
				src={logoSrc}
				alt="Explore Fusion"
				className="h-8 w-8 rounded-xl object-contain bg-white/60 dark:bg-white/10"
				loading="eager"
				decoding="async"
        onError={handleLogoError}
			/>
          Explore <span className="text-trail">Fusion</span>
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
            className="md:hidden inline-flex items-center justify-center rounded-2xl border border-soft/80 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-charcoal dark:text-sand"
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
            <Link key={l.to} to={l.to} className="text-charcoal/80 dark:text-sand/80 hover:text-trail transition font-semibold">
              {l.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <Button as={Link} to="/register" size="sm">
              Register
            </Button>
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

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <MotionButton
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-charcoal/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <MotionDiv
              className="md:hidden fixed top-0 right-0 z-50 h-dvh w-[86vw] max-w-sm border-l border-soft/80 dark:border-white/10 bg-white/80 dark:bg-charcoal/90 backdrop-blur-xl"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="font-heading font-bold text-mountain dark:text-sand">Menu</div>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileOpen(false)} aria-label="Close">
                  ✕
                </Button>
              </div>

              <div className="px-4 pb-4">
                <Button variant="secondary" size="sm" onClick={toggleTheme} className="w-full justify-center">
                  {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </Button>

                <div className="h-px bg-soft/80 dark:bg-white/10 my-4" />

                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setIsMobileOpen(false)}
                      className="rounded-2xl px-3 py-2 font-semibold text-charcoal/90 dark:text-sand/90 hover:bg-soft/60 dark:hover:bg-white/10 transition"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-soft/80 dark:bg-white/10 my-4" />

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
                    <span className="text-mountain dark:text-sand font-semibold truncate">{user?.name || 'User'}</span>
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