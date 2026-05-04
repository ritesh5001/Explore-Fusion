import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { T, Button, SectionLabel, Rule } from '../components/ui'
import { IconBack, IconShield, IconPin, IconHeart } from '../components/Icon'
import { getPublicProfile, swipeUser } from '../lib/api'
import type { MatchUser } from '../lib/api'

export function ProfileDetail({ token }: { token: string }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<MatchUser | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicProfile(token, id)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load profile'))
  }, [token, id])

  async function like() {
    if (!profile) return
    try {
      await swipeUser(token, { targetUserId: profile._id, action: 'right', compatibilityScore: 0 })
      navigate('/matches')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not like profile')
    }
  }

  if (error) {
    return <div style={{ padding: 32 }}><Notice>{error}</Notice></div>
  }

  if (!profile) {
    return <div style={{ padding: 32, color: T.muted }}>Loading profile...</div>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', overflowY: 'auto' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.muted, marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <IconBack size={12} /> Back to results
        </button>

        <div style={{ height: 360, overflow: 'hidden', borderRadius: 10, background: T.fill, display: 'grid', placeItems: 'center' }}>
          {profile.photos?.[0] ? <img src={profile.photos[0]} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 64, fontWeight: 900 }}>{profile.name.slice(0, 1).toUpperCase()}</span>}
        </div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{profile.name}</h1>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconPin size={12} /> {profile.homeCity ?? 'Unknown city'}</span>
              {profile.isVerified && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconShield size={12} /> Verified</span>}
              <span>{profile.languages?.join(' · ')}</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 18, color: T.ink }}>{profile.bio ?? 'No bio yet.'}</p>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Interests</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {(profile.interests ?? []).map((tag) => (
              <span key={tag} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: `1px solid ${T.line}`, color: T.ink }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderLeft: `1px solid ${T.line}`, padding: 24, background: 'var(--fill-soft)', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
        <SectionLabel>Travel profile</SectionLabel>
        <div style={{ borderRadius: 12, border: `1px solid ${T.line}`, background: 'var(--bg)', padding: 14 }}>
          <Info label="Style" value={profile.travelStyle ?? 'Not set'} />
          <Rule my={10} />
          <Info label="Trust score" value={String(profile.trustScore ?? 4.5)} />
          <Rule my={10} />
          <Info label="Dream destinations" value={(profile.dreamDestinations ?? []).join(', ') || 'Not set'} />
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Button variant="filled" size="lg" block icon={<IconHeart size={15} />} onClick={() => void like()}>
            Like {profile.name.split(' ')[0]}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  )
}

function Notice({ children }: { children: string }) {
  return <div style={{ padding: 12, borderRadius: 8, background: '#fff0e9', border: '1px solid #efb49f', color: '#7a2c19', fontSize: 13, fontWeight: 700 }}>{children}</div>
}
