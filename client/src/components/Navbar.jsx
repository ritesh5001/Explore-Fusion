import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef } from 'react';
import useAuth from '../auth/useAuth';
import API from '../api';
import { motion, useReducedMotion } from 'framer-motion';
import { Bell, MessageCircle } from 'lucide-react';
import SafeImage from './common/SafeImage';
import GlassNavbarContainer from './header/GlassNavbarContainer';
import CircularMenuOverlay, { CircularMenuToggleIcon } from './header/CircularMenuOverlay';
import { fadeLift, glassShift } from '../theme/variants';

const MotionDiv = motion.div;

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeNotifications = (body) => {
	const data = body?.data ?? body;
	return asArray(data?.notifications ?? data?.items ?? data);
};

const getIsRead = (n) => Boolean(n?.read ?? n?.isRead ?? n?.seen);

const Navbar = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { user, isAuthenticated, logout } = useAuth();
  const initialScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(initialScrollY);
  const lastRevealY = useRef(initialScrollY);
  const rafId = useRef(null);
  const [hideThreshold, setHideThreshold] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight * 0.35 : 0
  );
  const isVisibleRef = useRef(isVisible);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

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

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const avatarSrc = user?.avatar || '';
  const avatarAlt = user?.name ? `${user.name} avatar` : 'Profile avatar';

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    const updateThreshold = () => {
      setHideThreshold(window.innerHeight * 0.35);
    };

    // keep threshold current on resize
    updateThreshold();
    window.addEventListener('resize', updateThreshold);

    const handle = () => {
      if (rafId.current) return;
      rafId.current = window.requestAnimationFrame(() => {
        const currentY = window.scrollY || 0;
        const isScrollingDown = currentY > lastScrollY.current;

        if (isScrollingDown) {
          const scrollDistance = currentY - lastRevealY.current;
          if (scrollDistance > hideThreshold && isVisibleRef.current) {
            setIsVisible(false);
          }
        } else if (currentY < lastScrollY.current) {
          if (!isVisibleRef.current) {
            setIsVisible(true);
          }
          lastRevealY.current = currentY;
        }

        lastScrollY.current = currentY;
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', handle, { passive: true });
    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', updateThreshold);
      if (rafId.current) window.cancelAnimationFrame(rafId.current);
    };
  }, [hideThreshold]);

  const navVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], type: 'tween' },
    },
    hidden: {
      y: -24,
      opacity: 0,
      transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1], type: 'tween' },
    },
  };

  const luxuryEase = [0.22, 0.61, 0.36, 1];
  const basePadding = 8;
  const paddingBoost = prefersReducedMotion ? 2 : 4;
  const navHoverVariants = {
    rest: {
      paddingTop: basePadding,
      paddingBottom: basePadding,
      transition: { duration: 0.35, ease: luxuryEase },
    },
    hover: {
      paddingTop: basePadding + paddingBoost,
      paddingBottom: basePadding + paddingBoost,
      transition: { duration: 0.45, ease: luxuryEase },
    },
  };

  const contentScaleVariants = {
    rest: {
      scale: 1,
      transition: { duration: 0.35, ease: luxuryEase },
    },
    hover: {
      scale: prefersReducedMotion ? 1 : 1.03,
      transition: { duration: 0.45, ease: luxuryEase },
    },
  };

  const [isNavbarHovered, setIsNavbarHovered] = useState(false);

  return (
    <motion.header
      variants={navVariants}
      initial="visible"
      animate={isVisible ? 'visible' : 'hidden'}
      className="fixed left-0 right-0 top-2 z-60 pointer-events-auto"
      style={{ willChange: 'transform, opacity' }}
    >
      <MotionDiv variants={fadeLift} initial={false} animate={isScrolled ? 'scrolled' : 'rest'}>
      <div className="container-app pt-2 pb-2">
        <MotionDiv
          variants={navHoverVariants}
          initial="rest"
          whileHover="hover"
          animate="rest"
          onHoverStart={() => setIsNavbarHovered(true)}
          onHoverEnd={() => setIsNavbarHovered(false)}
        >
          <GlassNavbarContainer
            variants={glassShift}
            initial={false}
            animate={isScrolled ? 'scrolled' : 'rest'}
            className={
              'relative px-3 py-2 transition-shadow ease-soft-out duration-400 ' +
              (isScrolled ? 'shadow-[0_6px_12px_rgba(0,0,0,0.06)]' : 'shadow-[0_4px_10px_rgba(0,0,0,0.04)]')
            }
          >
            <MotionDiv
              variants={contentScaleVariants}
              initial="rest"
              animate={isNavbarHovered ? 'hover' : 'rest'}
              className="relative flex items-center gap-2"
            >
              <button
                ref={menuButtonRef}
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.4)] bg-white/20 text-charcoal hover:bg-white/30 transition-[background-color,transform,opacity] ease-standard duration-200 active:scale-[0.98] active:duration-120"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((v) => !v)}
              >
                <CircularMenuToggleIcon open={isMenuOpen} />
              </button>

              {isAuthenticated ? (
                <Link
                  to="/profile"
                  aria-label="Open profile"
                  className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-black/8 bg-white/20 hover:bg-white/30 transition-[background-color,transform,opacity] ease-standard duration-200 active:scale-[0.98] active:duration-120"
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
                  className="h-10 w-10 rounded-full border-2 border-black/8 bg-white/20 hover:bg-white/30 transition-[background-color,transform,opacity] ease-standard duration-200 active:scale-[0.98] active:duration-120"
                />
              )}

              <Link
                to="/"
                aria-label="Go to home"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-2xl px-2 py-1 text-charcoal transition-[opacity,transform] ease-standard duration-200 hover:opacity-95"
              >
                <SafeImage
                  src={LOGO_URL}
                  fallback="/images/placeholder.svg"
                  alt="Explore Fusion"
                  className="h-7 w-7 rounded-xl object-contain"
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
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.36)] bg-white/18 text-charcoal hover:bg-white/26 transition-[background-color,transform,opacity] ease-standard duration-200 active:scale-[0.98] active:duration-120"
                >
                  <Bell className="h-4 w-4" />
                  {hasUnreadNotifications && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />}
                </Link>

                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1.5 text-charcoal font-medium shadow-[0_6px_12px_rgba(0,0,0,0.04)] transition-[background-color,transform,box-shadow] ease-standard duration-200 hover:bg-[#b89250] hover:-translate-y-px hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] active:scale-[0.98] active:duration-120"
                  aria-label="Open chat"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">Chat</span>
                </Link>
              </div>
            </MotionDiv>
          </GlassNavbarContainer>
        </MotionDiv>
      </div>
    </MotionDiv>

    <CircularMenuOverlay
      open={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      menuButtonRef={menuButtonRef}
      links={links}
      isAuthenticated={isAuthenticated}
      userName={user?.name || ''}
      onLogout={handleLogout}
    />
  </motion.header>
  );
};

export default Navbar;