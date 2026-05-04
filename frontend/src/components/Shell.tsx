import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { T } from './ui'
import { IconSearch, IconLogout } from './Icon'

const NAV_LINKS = [
  { to: '/discover', label: 'Discover' },
  { to: '/matches', label: 'Matches' },
  { to: '/trips', label: 'Group trips' },
  { to: '/chat', label: 'Chat' },
]

interface ShellProps {
  children: ReactNode
  user?: { name: string; photos?: string[] } | null
  onLogout?: () => void
}

export function Shell({ children, user, onLogout }: ShellProps) {
  const { pathname } = useLocation()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <header style={{
        height: 56, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24,
        borderBottom: `1px solid ${T.line}`, flexShrink: 0, background: 'var(--bg)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, textDecoration: 'none', color: T.ink }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: T.ink, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>EF</div>
          Explore Fusion
        </Link>

        {/* Nav links */}
        {user && (
          <nav style={{ display: 'flex', gap: 4 }}>
            {NAV_LINKS.map(({ to, label }) => {
              const active = pathname.startsWith(to)
              return (
                <Link key={to} to={to} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                  background: active ? T.fill : 'transparent',
                  color: active ? T.ink : T.muted,
                  textDecoration: 'none',
                }}>{label}</Link>
              )
            })}
          </nav>
        )}

        {/* Right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {user && (
            <div style={{ width: 240, height: 32, padding: '0 10px', borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 11.5, color: T.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconSearch size={13} /> Search destinations, buddies…
            </div>
          )}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: `1px solid ${T.line}` }}>
                {user.photos?.[0] ? (
                  <img src={user.photos[0]} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: T.ink, color: '#fff', fontSize: 11, fontWeight: 800 }}>
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={onLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, border: `1px solid ${T.line}`, background: 'transparent', color: T.muted, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
              >
                <IconLogout size={13} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/auth" style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${T.line}`, fontSize: 12.5, fontWeight: 600, color: T.ink, textDecoration: 'none' }}>Login</Link>
              <Link to="/auth?mode=register" style={{ padding: '6px 14px', borderRadius: 6, background: T.ink, fontSize: 12.5, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>Sign up</Link>
            </div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}

// Minimal shell for full-screen pages (onboarding, auth)
export function MinimalShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        height: 56, padding: '0 24px', display: 'flex', alignItems: 'center',
        borderBottom: `1px solid ${T.line}`, flexShrink: 0, background: 'var(--bg)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, textDecoration: 'none', color: T.ink }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: T.ink, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>EF</div>
          Explore Fusion
        </Link>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  )
}
