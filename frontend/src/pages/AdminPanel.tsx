import { useEffect, useState } from 'react'
import { T, Button } from '../components/ui'
import { getAdminSummary, getAdminUsers, loginAdmin, updateUserModeration } from '../lib/api'
import type { AdminSummary, AppUser } from '../lib/api'

const ADMIN_SESSION_KEY = 'ef_admin_session'
const ADMIN_EMAIL = 'nextgenfusion.devs@gmail.com'

export function AdminPanel() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_SESSION_KEY) ?? '')
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [users, setUsers] = useState<AppUser[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  async function load(token = adminToken) {
    if (!token) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const [nextSummary, nextUsers] = await Promise.all([
        getAdminSummary(token),
        getAdminUsers(token),
      ])
      setSummary(nextSummary)
      setUsers(nextUsers)
    } catch (err) {
      if (err instanceof Error && /token/i.test(err.message)) {
        localStorage.removeItem(ADMIN_SESSION_KEY)
        setAdminToken('')
      }
      setError(err instanceof Error ? err.message : 'Could not load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleLogin() {
    setAuthLoading(true)
    setError('')
    try {
      const session = await loginAdmin({ email, password })
      localStorage.setItem(ADMIN_SESSION_KEY, session.token)
      setAdminToken(session.token)
      setPassword('')
      await load(session.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in to admin')
    } finally {
      setAuthLoading(false)
    }
  }

  async function moderate(userId: string, input: Parameters<typeof updateUserModeration>[2]) {
    setError('')
    try {
      const updated = await updateUserModeration(adminToken, userId, input)
      setUsers((current) => current.map((user) => user._id === updated._id ? updated : user))
      const nextSummary = await getAdminSummary(adminToken)
      setSummary(nextSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update user')
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--fill-soft)', padding: 24 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <div>
            <div style={labelStyle}>Admin control panel</div>
            <h1 style={{ margin: '6px 0 0', fontSize: 30, lineHeight: 1.15 }}>Account and verification review</h1>
          </div>
          {!adminToken && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Admin email"
                type="email"
                autoComplete="username"
                style={{ ...inputStyle, width: 240 }}
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                style={{ ...inputStyle, width: 220 }}
              />
              <Button variant="filled" onClick={() => void handleLogin()}>{authLoading ? 'Signing in...' : 'Sign in'}</Button>
            </div>
          )}
        </div>

        {error && <div style={{ ...noticeStyle, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 18 }}>
          <Metric label="Users" value={summary?.totalUsers ?? 0} />
          <Metric label="Pending accounts" value={summary?.pendingAccounts ?? 0} />
          <Metric label="Pending photos" value={summary?.pendingPhotos ?? 0} />
          <Metric label="Pending ID" value={summary?.pendingVerification ?? 0} />
          <Metric label="Approved" value={summary?.approvedAccounts ?? 0} />
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {users.map((user) => (
            <UserReviewCard key={user._id} user={user} onModerate={(input) => void moderate(user._id, input)} />
          ))}
        </div>

        {!users.length && (
          <div style={{ padding: 40, textAlign: 'center', color: T.muted, border: `1px dashed ${T.line}`, borderRadius: 8, background: 'var(--bg)' }}>
            {adminToken
              ? loading
                ? 'Loading review queue...'
                : 'No users found.'
              : 'Open /admin and sign in with the admin account to load review controls.'}
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: `1px solid ${T.line}`, borderRadius: 8, background: 'var(--bg)', padding: 14 }}>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: T.muted, fontWeight: 700, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function UserReviewCard({
  user,
  onModerate,
}: {
  user: AppUser
  onModerate: (input: Parameters<typeof updateUserModeration>[2]) => void
}) {
  const submission = user.verificationSubmission

  return (
    <article style={{ border: `1px solid ${T.line}`, borderRadius: 8, background: 'var(--bg)', padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 410px', gap: 18 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>{user.name}</h2>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{user.email} · {user.homeCity ?? 'No city'}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <StatusPill label={`Account: ${user.accountStatus ?? 'pending'}`} />
              <StatusPill label={`Photo: ${user.photoVerificationStatus ?? 'not-submitted'}`} />
              <StatusPill label={`ID: ${user.verificationStatus ?? 'not-submitted'}`} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
            <ReviewImage title="Profile photo" src={submission?.profilePhoto ?? user.photos?.[0]} />
            <ReviewImage title="Verification selfie" src={submission?.verificationSelfie} />
            <ReviewImage title="ID document" src={submission?.idDocument} />
          </div>

          {submission?.note && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: T.fill, fontSize: 12.5 }}>
              {submission.note}
            </div>
          )}
        </div>

        <div style={{ borderLeft: `1px solid ${T.line}`, paddingLeft: 18, display: 'grid', gap: 14, alignContent: 'start' }}>
          <ControlGroup title="Account approval">
            <Button variant="filled" onClick={() => onModerate({ accountStatus: 'approved' })}>Approve account</Button>
            <Button onClick={() => onModerate({ accountStatus: 'rejected', rejectionReason: 'Account rejected by admin' })}>Reject</Button>
            <Button onClick={() => onModerate({ accountStatus: 'suspended', rejectionReason: 'Account suspended by admin' })}>Suspend</Button>
          </ControlGroup>

          <ControlGroup title="Photo verification">
            <Button variant="filled" onClick={() => onModerate({ photoVerificationStatus: 'approved' })}>Approve photo</Button>
            <Button onClick={() => onModerate({ photoVerificationStatus: 'rejected', rejectionReason: 'Photo verification rejected' })}>Reject photo</Button>
          </ControlGroup>

          <ControlGroup title="ID verification">
            <Button variant="filled" onClick={() => onModerate({ verificationStatus: 'approved' })}>Approve ID</Button>
            <Button onClick={() => onModerate({ verificationStatus: 'rejected', rejectionReason: 'ID verification rejected' })}>Reject ID</Button>
          </ControlGroup>

          <div style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.45 }}>
            Verified badge turns on when both photo and ID verification are approved.
          </div>
        </div>
      </div>
    </article>
  )
}

function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

function StatusPill({ label }: { label: string }) {
  return (
    <span style={{ border: `1px solid ${T.line}`, borderRadius: 999, padding: '4px 8px', fontSize: 10.5, fontWeight: 800, color: T.muted }}>
      {label}
    </span>
  )
}

function ReviewImage({ title, src }: { title: string; src?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{title}</div>
      <div style={{ height: 150, border: `1px dashed ${T.line}`, borderRadius: 8, overflow: 'hidden', display: 'grid', placeItems: 'center', background: T.fill }}>
        {src ? <img src={src} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 11.5, color: T.muted }}>Not submitted</span>}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: T.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  height: 38,
  padding: '0 12px',
  border: `1px solid ${T.line}`,
  borderRadius: 8,
  fontSize: 13,
  color: T.ink,
  background: '#fff',
  outline: 'none',
}

const noticeStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  background: '#fff0e9',
  border: '1px solid #efb49f',
  color: '#7a2c19',
  fontSize: 13,
  fontWeight: 700,
}
