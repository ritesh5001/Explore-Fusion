import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, Chip, Button, SectionLabel } from '../components/ui'
import { IconPin, IconShield, IconSliders } from '../components/Icon'
import { getDiscoverProfiles, swipeUser } from '../lib/api'
import type { DiscoverProfile } from '../lib/api'

export function Discover({ token }: { token: string }) {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setProfiles(await getDiscoverProfiles(token))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load profiles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token])

  const filtered = profiles.filter((profile) => !verifiedOnly || profile.isVerified)

  async function swipe(profile: DiscoverProfile, action: 'left' | 'right' | 'super') {
    try {
      await swipeUser(token, {
        targetUserId: String(profile.id ?? profile._id),
        action,
        compatibilityScore: profile.compatibilityScore
      })
      setProfiles((current) => current.filter((item) => String(item.id ?? item._id) !== String(profile.id ?? profile._id)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save swipe')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <aside style={{ borderRight: `1px solid ${T.line}`, padding: 20, overflowY: 'auto', background: 'var(--fill-soft)' }}>
        <SectionLabel>Filters</SectionLabel>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: 11.5 }}>
            <span style={{ fontWeight: 600 }}>Verified only</span>
            <div onClick={() => setVerifiedOnly(!verifiedOnly)} style={{ width: 32, height: 18, borderRadius: 9, background: verifiedOnly ? T.ink : T.fill, position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', top: 2, right: verifiedOnly ? 2 : undefined, left: verifiedOnly ? undefined : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
        </div>
      </aside>

      <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Discover approved travelers</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Sorted by compatibility from your saved preferences.</div>
          </div>
        </div>

        {error && <Notice>{error}</Notice>}
        {loading && <EmptyState label="Loading approved travelers..." />}
        {!loading && !filtered.length && <EmptyState label="No compatible approved travelers yet. Approve more accounts or wait for new users." />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 14 }}>
          {filtered.map((profile) => (
            <div key={String(profile.id ?? profile._id)} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.line}`, background: 'var(--bg)' }}>
              <div onClick={() => navigate(`/profile/${profile.id ?? profile._id}`)} style={{ cursor: 'pointer' }}>
                <ProfileImage profile={profile} />
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{profile.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                    {profile.isVerified && <><IconShield size={11} /> Verified · </>}<IconPin size={11} /> {profile.homeCity ?? 'Unknown city'}
                  </div>
                  <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.45, minHeight: 34 }}>{profile.bio ?? 'No bio yet.'}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {profile.interests.slice(0, 4).map((tag) => <Chip key={tag} small>{tag}</Chip>)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: `1px solid ${T.line}` }}>
                <Button variant="outline" size="sm" block onClick={() => void swipe(profile, 'left')}>Skip</Button>
                <Button variant="filled" size="sm" block onClick={() => void swipe(profile, 'right')}>Like</Button>
                <Button variant="outline" size="sm" onClick={() => void swipe(profile, 'super')}>Star</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfileImage({ profile }: { profile: DiscoverProfile }) {
  return (
    <div style={{ position: 'relative', aspectRatio: '4 / 5', background: T.fill, display: 'grid', placeItems: 'center' }}>
      {profile.photos?.[0] ? (
        <img src={profile.photos[0]} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: 44, fontWeight: 900 }}>{profile.name.slice(0, 1).toUpperCase()}</span>
      )}
      <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, fontWeight: 800 }}>
        {profile.compatibilityScore}% match
      </div>
    </div>
  )
}

function Notice({ children }: { children: string }) {
  return <div style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#fff0e9', border: '1px solid #efb49f', color: '#7a2c19', fontSize: 13, fontWeight: 700 }}>{children}</div>
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted }}>
      <IconSliders size={32} />
      <div style={{ marginTop: 12, fontWeight: 600 }}>{label}</div>
    </div>
  )
}
