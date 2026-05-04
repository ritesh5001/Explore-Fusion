import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, PHOTOS, WFImage, Button } from '../components/ui'
import { IconPlus } from '../components/Icon'

const TRIPS = [
  {
    id: 'bali',
    img: PHOTOS.bali,
    title: 'Bali, Indonesia',
    dates: 'Jul 4 — Jul 16',
    stats: '5 buddies · 2 unread · 1 pending',
    buddies: [
      { id: 'priya', name: 'Priya', src: PHOTOS.priya, status: 'matched', last: 'Tegallalang day 2?', time: '2m', unread: 2 },
      { id: 'rahul', name: 'Rahul', src: PHOTOS.rahul, status: 'matched', last: 'Sent homestay link', time: '1h', unread: 0 },
      { id: 'ananya', name: 'Ananya', src: PHOTOS.ananya, status: 'pending', last: 'Wants to join', time: '5h', unread: 0 },
      { id: 'meera', name: 'Meera', src: PHOTOS.meera, status: 'matched', last: 'Yoga class on Jul 7', time: '1d', unread: 0 },
      { id: 'arjun', name: 'Arjun', src: PHOTOS.arjun, status: 'matched', last: 'Surf 6am 🏄', time: '2d', unread: 0 },
    ] as BuddyRow[],
  },
  {
    id: 'vietnam',
    img: PHOTOS.vietnam,
    title: 'Vietnam',
    dates: 'Aug 2 — Aug 14',
    stats: '7 buddies · 1 unread · 2 pending',
    buddies: [
      { id: 'vikram', name: 'Vikram', src: PHOTOS.vikram, status: 'matched', last: 'Trains booked!', time: '3d', unread: 0 },
      { id: 'meera', name: 'Meera', src: PHOTOS.meera, status: 'matched', last: 'Photo · Hanoi old quarter', time: '1d', unread: 1 },
    ] as BuddyRow[],
  },
]

interface BuddyRow {
  id: string
  name: string
  src: string
  status: 'matched' | 'pending'
  last: string
  time: string
  unread: number
}

export function Matches() {
  return (
    <div style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Your trips & buddies</h1>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4 }}>2 active trips · 12 buddies total · 3 pending requests</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="md">Past trips</Button>
          <Button variant="filled" size="md" icon={<IconPlus size={13} />}>New trip</Button>
        </div>
      </div>

      {/* Trip blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {TRIPS.map((trip) => <TripBlock key={trip.id} {...trip} />)}
      </div>
    </div>
  )
}

function TripBlock({ img, title, dates, stats, buddies }: typeof TRIPS[0]) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, background: 'var(--bg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr' }}>
        {/* Trip image */}
        <div style={{ position: 'relative', minHeight: 160 }}>
          <img src={img} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', inset: 0, padding: 16,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{dates}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{title}</div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>{stats}</div>
          </div>
        </div>

        {/* Buddy list */}
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column' }}>
          {buddies.map((b, i) => (
            <div
              key={b.id + i}
              onClick={() => navigate(`/chat/${b.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px',
                borderTop: i === 0 ? 'none' : `1px solid ${T.fill}`,
                cursor: 'pointer', borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--fill-soft)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src={b.src} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ minWidth: 90 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
                {b.status === 'pending' && (
                  <span style={{ fontSize: 9, padding: '1px 5px', background: '#fff4b8', color: '#7a5a10', borderRadius: 3, fontWeight: 700 }}>PENDING</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: b.unread ? T.ink : T.muted, fontWeight: b.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {b.last}
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, width: 40, textAlign: 'right' }}>{b.time}</div>
              {b.unread > 0 ? (
                <div style={{ width: 18, height: 18, borderRadius: 9, background: T.accent, color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {b.unread}
                </div>
              ) : <div style={{ width: 18 }} />}
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '8px 4px 0', display: 'flex', gap: 6, borderTop: `1px solid ${T.fill}` }}>
            <Button variant="outline" size="sm">Open trip plan</Button>
            <Button variant="ghost" size="sm">Group chat</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
