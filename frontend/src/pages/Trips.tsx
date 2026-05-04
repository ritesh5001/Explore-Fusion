import { useNavigate } from 'react-router-dom'
import { T, PHOTOS, WFImage, Button } from '../components/ui'
import { IconPlus, IconPin, IconCal } from '../components/Icon'

const GROUP_TRIPS = [
  { id: 'bali-grp', img: PHOTOS.bali, dest: 'Bali, Indonesia', dates: 'Jul 4 — Jul 16', members: 3, max: 6, style: 'Budget', description: 'Ubud yoga + Canggu surf + Nusa diving. Flexible daily plans, shared stays.', tags: ['Yoga', 'Surfing', 'Diving', 'Hostels'] },
  { id: 'vietnam-grp', img: PHOTOS.vietnam, dest: 'Vietnam', dates: 'Aug 2 — Aug 14', members: 4, max: 7, style: 'Budget', description: 'Hanoi → Hạ Long Bay → Hội An. Train travel, street food focused.', tags: ['Food walks', 'Heritage', 'Photography'] },
  { id: 'himachal-grp', img: PHOTOS.himachal, dest: 'Himachal Pradesh', dates: 'Jun 10 — Jun 22', members: 2, max: 5, style: 'Backpacker', description: 'Kasol → Kheerganga trek → Manali. High altitude camping.', tags: ['Trekking', 'Camping', 'Hiking'] },
  { id: 'meghalaya-grp', img: PHOTOS.meghalaya, dest: 'Meghalaya', dates: 'Oct 3 — Oct 12', members: 1, max: 4, style: 'Mid-range', description: 'Living root bridges, Cherrapunji caves, Dawki river.', tags: ['Photography', 'Hiking', 'Wildlife'] },
]

export function Trips() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Open group trips</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '6px 0 0' }}>Find a group that fits your plan</h1>
          <p style={{ fontSize: 14, color: T.muted, marginTop: 6 }}>Request to join any open trip. Organized by travelers going to the same place.</p>
        </div>
        <Button variant="filled" size="md" icon={<IconPlus size={13} />}>Create a trip</Button>
      </div>

      {/* Trip grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {GROUP_TRIPS.map((trip) => (
          <div key={trip.id} style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, background: 'var(--bg)', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ position: 'relative' }}>
              <WFImage src={trip.img} ratio="16/7" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65) 100%)', padding: '16px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Group trip · {trip.style}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{trip.dest}</div>
              </div>
              {/* Member count */}
              <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                {trip.members}/{trip.max} joined
              </div>
            </div>

            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.muted, marginBottom: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCal size={12} /> {trip.dates}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconPin size={12} /> {trip.dest.split(',')[0]}</span>
              </div>
              <p style={{ fontSize: 13, color: T.ink, margin: '0 0 12px', lineHeight: 1.5 }}>{trip.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {trip.tags.map((t) => (
                  <span key={t} style={{ padding: '4px 9px', fontSize: 11, fontWeight: 500, borderRadius: 999, border: `1px solid ${T.line}`, color: T.ink }}>{t}</span>
                ))}
              </div>

              {/* Member avatars + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[PHOTOS.priya, PHOTOS.rahul, PHOTOS.ananya].slice(0, trip.members).map((src, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--bg)', marginLeft: i === 0 ? 0 : -8 }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                  <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>{trip.members} going · {trip.max - trip.members} spots left</span>
                </div>
                <Button variant="filled" size="sm" onClick={() => navigate('/matches')}>Request to join</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
