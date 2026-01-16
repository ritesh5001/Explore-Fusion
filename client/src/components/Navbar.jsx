import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import useAuth from '../auth/useAuth';
import API from '../api';
import { motion } from 'framer-motion';
import { Bell, Menu, MessageCircle } from 'lucide-react';
import SafeImage from './common/SafeImage';
import GlassNavbarContainer from './header/GlassNavbarContainer';
import MobileMenuDrawer from './header/MobileMenuDrawer';

const MotionDiv = motion.div;

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeNotifications = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.notifications ?? data?.items ?? data);
};

const getIsRead = (n) => Boolean(n?.read ?? n?.isRead ?? n?.seen);

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const LOGO_URL = import.meta.env.VITE_BRAND_LOGO_URL || '/branding/logo.png';

  const handleLogout = () => {
	setIsMenuOpen(false);
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

  useEffect(() => {
    let alive = true;
    if (!isAuthenticated) return undefined;

    (async () => {
      try {
        const res = await API.get('/notifications/my');
        const items = normalizeNotifications(res?.data);
        const unread = asArray(items).some((n) => !getIsRead(n));
        if (alive) setHasUnreadNotifications(Boolean(unread));
      } catch {
        if (alive) setHasUnreadNotifications(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  const avatarSrc = user?.avatar || '';
  const avatarAlt = user?.name ? `${user.name} avatar` : 'Profile avatar';

  return (
  <MotionDiv
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
  >
    <header className="sticky top-0 z-50">
      <div className="container-app pt-4 pb-3">
        <GlassNavbarContainer className="relative px-3 py-3">
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.4)] bg-white/20 text-charcoal hover:bg-white/30 transition"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <Link
                to="/profile"
                aria-label="Open profile"
                className="relative h-10 w-10 rounded-full overflow-hidden border-[2px] border-black/[0.08] bg-white/20 hover:bg-white/30 transition"
              >
                <SafeImage
                  src={avatarSrc}
                  alt={avatarAlt}
                  fallback="/avatar-placeholder.png"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label="Sign in"
                className="h-10 w-10 rounded-full border-[2px] border-black/[0.08] bg-white/20 hover:bg-white/30 transition"
              />
            )}

            <Link
              to="/"
              aria-label="Go to home"
              className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-2xl px-2 py-1 text-charcoal"
            >
              <SafeImage
                src={LOGO_URL}
                fallback="/images/placeholder.svg"
                alt="Explore Fusion"
                className="h-7 w-7 rounded-xl object-contain bg-white"
                loading="eager"
                decoding="async"
              />
              <span className="hidden sm:inline text-lg font-heading font-medium tracking-[0.06em]">
                Explore <span className="text-gold">Fusion</span>
              </span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/notifications"
                aria-label="Open notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.4)] bg-white/20 text-charcoal hover:bg-white/30 transition"
              >
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold" />}
              </Link>

              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-charcoal font-medium shadow-[0_10px_20px_rgba(0,0,0,0.06)] transition hover:bg-[#b89250] hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] active:translate-y-0"
                aria-label="Open chat"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Chat</span>
              </Link>
            </div>
          </div>
        </GlassNavbarContainer>
      </div>

      <MobileMenuDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        links={links}
        isAuthenticated={isAuthenticated}
        userName={user?.name || ''}
        onLogout={handleLogout}
      />
    </header>
  </MotionDiv>
  );
};

export default Navbar;