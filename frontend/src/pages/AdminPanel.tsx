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
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
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

        {adminToken ? (
          <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 18, alignItems: 'start' }}>
            <aside style={{ position: 'sticky', top: 80 }}>
              <div style={{ border: `1px solid ${T.line}`, borderRadius: 8, background: 'var(--bg)', padding: 18 }}>
                <div style={labelStyle}>Review queue</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{users.length}</div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, marginTop: 8 }}>
                  Check submissions, compare profile and verification images, then approve the account and both verification states.
                </div>

                <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                  <SidebarMetric label="Total users" value={summary?.totalUsers ?? 0} />
                  <SidebarMetric label="Pending accounts" value={summary?.pendingAccounts ?? 0} />
                  <SidebarMetric label="Pending photos" value={summary?.pendingPhotos ?? 0} />
                  <SidebarMetric label="Pending ID" value={summary?.pendingVerification ?? 0} />
                  <SidebarMetric label="Approved users" value={summary?.approvedAccounts ?? 0} />
                </div>

                <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.line}` }}>
                  <Button variant="filled" onClick={() => void load()}>
                    {loading ? 'Refreshing...' : 'Refresh review data'}
                  </Button>
                  <div style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.5, marginTop: 10 }}>
                    Verified status turns on only after both photo and ID are approved.
                  </div>
                </div>
              </div>
            </aside>

            <section>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 18 }}>
                <Metric label="Users" value={summary?.totalUsers ?? 0} />
                <Metric label="Pending review items" value={(summary?.pendingAccounts ?? 0) + (summary?.pendingPhotos ?? 0) + (summary?.pendingVerification ?? 0)} />
                <Metric label="Approved accounts" value={summary?.approvedAccounts ?? 0} />
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {users.map((user) => (
                  <UserReviewCard key={user._id} user={user} onModerate={(input) => void moderate(user._id, input)} />
                ))}
              </div>

              {!users.length && (
                <div style={{ padding: 40, textAlign: 'center', color: T.muted, border: `1px dashed ${T.line}`, borderRadius: 8, background: 'var(--bg)' }}>
                  {loading ? 'Loading review queue...' : 'No users found.'}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div style={{ border: `1px solid ${T.line}`, borderRadius: 8, background: 'var(--bg)', padding: 24, display: 'grid', gridTemplateColumns: '1.1fr 420px', gap: 24, alignItems: 'start' }}>
            <div>
              <div style={labelStyle}>Private route access</div>
              <h2 style={{ margin: '10px 0 0', fontSize: 26, lineHeight: 1.15 }}>Admin access is only available through `/admin`</h2>
              <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginTop: 12, maxWidth: 560 }}>
                This workspace does not expose admin controls in public navigation. Sign in here with the admin account to load the moderation queue, approval controls, and verification review.
              </div>
            </div>

            <div style={{ border: `1px solid ${T.line}`, borderRadius: 8, padding: 18, background: 'var(--fill-soft)' }}>
              <div style={labelStyle}>Admin sign in</div>
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Admin email"
                  type="email"
                  autoComplete="username"
                  style={inputStyle}
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  type="password"
                  autoComplete="current-password"
                  style={inputStyle}
                />
                <Button variant="filled" onClick={() => void handleLogin()}>
                  {authLoading ? 'Signing in...' : 'Open admin controls'}
                </Button>
              </div>
            </div>
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

function SidebarMetric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 8, background: T.fill }}>
      <div style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{value}</div>
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
  const coverPhoto = submission?.profilePhoto ?? user.photos?.[0]
  const statusTone = getStatusTone(user.accountStatus)
  const photoTone = getStatusTone(user.photoVerificationStatus)
  const verificationTone = getStatusTone(user.verificationStatus)

  return (
    <article style={{ border: `1px solid ${T.line}`, borderRadius: 8, background: 'var(--bg)', padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr) 340px', gap: 18, alignItems: 'start' }}>
        <div style={{ borderRight: `1px solid ${T.line}`, paddingRight: 18 }}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: T.fill, flexShrink: 0 }}>
                {coverPhoto ? (
                  <img src={coverPhoto} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800 }}>
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 21, lineHeight: 1.1 }}>{user.name}</h2>
                <div style={{ color: T.muted, fontSize: 12.5, marginTop: 5 }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <IdentityRow label="Home city" value={user.homeCity ?? 'Not added'} />
              <IdentityRow label="Phone" value={user.phone ?? 'Not added'} />
              <IdentityRow label="Gender" value={user.gender ?? 'Not added'} />
              <IdentityRow label="Onboarding" value={user.onboardingCompleted ? 'Completed' : 'Incomplete'} />
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <StatusPill label={`Account ${user.accountStatus ?? 'pending'}`} tone={statusTone} />
              <StatusPill label={`Photo ${user.photoVerificationStatus ?? 'not-submitted'}`} tone={photoTone} />
              <StatusPill label={`ID ${user.verificationStatus ?? 'not-submitted'}`} tone={verificationTone} />
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
            <div>
              <div style={labelStyle}>Submitted verification assets</div>
              <div style={{ color: T.muted, fontSize: 12.5, marginTop: 4 }}>
                Compare the profile image with the selfie and ID before approving.
              </div>
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

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gap: 2 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{value}</div>
    </div>
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

function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'pending' | 'approved' | 'rejected' }) {
  const styles = {
    neutral: { background: '#f5f5f5', color: T.muted, border: T.line },
    pending: { background: '#fff8e6', color: '#8a6116', border: '#e8d08f' },
    approved: { background: '#edf8ef', color: '#1f6a36', border: '#a8d2b0' },
    rejected: { background: '#fff0ee', color: '#8a2f2a', border: '#e4a9a3' },
  }[tone]

  return (
    <span style={{ border: `1px solid ${styles.border}`, borderRadius: 999, padding: '6px 10px', fontSize: 11, fontWeight: 800, color: styles.color, background: styles.background }}>
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

function getStatusTone(status?: string): 'neutral' | 'pending' | 'approved' | 'rejected' {
  if (status === 'approved') {
    return 'approved'
  }

  if (status === 'rejected' || status === 'suspended') {
    return 'rejected'
  }

  if (status === 'pending') {
    return 'pending'
  }

  return 'neutral'
}
