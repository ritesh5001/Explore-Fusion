import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, Button } from '../components/ui'
import { IconPlus } from '../components/Icon'
import { getMatches } from '../lib/api'
import type { MatchRecord, MatchUser } from '../lib/api'

export function Matches({ token, currentUserId }: { token: string; currentUserId: string }) {
  const navigate = useNavigate()
  const [matches, setMatches] = useState<MatchRecord[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getMatches(token)
      .then(setMatches)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load matches'))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Your matches</h1>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4 }}>{matches.length} active conversations</div>
        </div>
        <Button variant="filled" size="md" icon={<IconPlus size={13} />} onClick={() => navigate('/trips')}>Plan a trip</Button>
      </div>

      {error && <Notice>{error}</Notice>}
      {loading && <Empty label="Loading matches..." />}
      {!loading && !matches.length && <Empty label="No matches yet. Like travelers in Discover; chat unlocks after a mutual like." />}

      <div style={{ display: 'grid', gap: 12 }}>
        {matches.map((match) => {
          const partner = getPartner(match, currentUserId)
          return (
            <button
              key={match._id}
              onClick={() => navigate(`/chat/${match._id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: `1px solid ${T.line}`, borderRadius: 10, background: 'var(--bg)', textAlign: 'left', cursor: 'pointer' }}
            >
              <Avatar user={partner} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{partner?.name ?? 'Traveler'}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{partner?.homeCity ?? 'Unknown city'} · {match.compatibilityScore}% match</div>
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>{new Date(match.matchedAt).toLocaleDateString()}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function getPartner(match: MatchRecord, currentUserId: string) {
  return match.users.find((user) => user._id !== currentUserId) ?? match.users[0]
}

function Avatar({ user }: { user?: MatchUser }) {
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: T.fill, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      {user?.photos?.[0] ? <img src={user.photos[0]} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 900 }}>{user?.name?.slice(0, 1).toUpperCase() ?? '?'}</span>}
    </div>
  )
}

function Notice({ children }: { children: string }) {
  return <div style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#fff0e9', border: '1px solid #efb49f', color: '#7a2c19', fontSize: 13, fontWeight: 700 }}>{children}</div>
}

function Empty({ label }: { label: string }) {
  return <div style={{ padding: 48, border: `1px dashed ${T.line}`, borderRadius: 10, color: T.muted, textAlign: 'center' }}>{label}</div>
}
