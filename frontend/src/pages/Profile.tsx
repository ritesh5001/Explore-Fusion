import { useParams, useNavigate } from 'react-router-dom'
import { T, PHOTOS, WFImage, Button, SectionLabel, Rule } from '../components/ui'
import { IconBack, IconShield, IconPin, IconHeart, IconMore } from '../components/Icon'

const PROFILES: Record<string, {
  name: string; age: number; city: string; score: number
  src: string; verified: boolean; trust: number; trips: number
  langs: string[]; bio: string; travelStyle: string
  budgetMin: number; budgetMax: number
  interests: Array<[string, boolean]>
  tripName: string; tripDates: string; tripNights: number; tripImg: string
  tripPace: string; tripStay: string
  whyMatch: string[]
  itinerary: Array<[string, string, string, boolean]>
}> = {
  priya: {
    name: 'Priya Shah', age: 27, city: 'Mumbai', score: 94,
    src: PHOTOS.priya, verified: true, trust: 4.8, trips: 12,
    langs: ['EN', 'HI', 'GU'], travelStyle: 'Budget',
    budgetMin: 1800, budgetMax: 4200,
    bio: 'Food walks, old city lanes, slow mornings, and clean hostels. I prefer planning the food spots and leaving days flexible. Looking for a chill buddy who shows up on time and is up for late-night chai conversations.',
    interests: [['Food walks', true], ['Hostels', true], ['Photography', true], ['Slow travel', true], ['Heritage', false], ['Markets', false], ['Yoga', false], ['Cafés', false]],
    tripName: 'Bali, Indonesia', tripDates: 'Jul 4 — Jul 16', tripNights: 12, tripImg: PHOTOS.bali,
    tripPace: 'Relaxed', tripStay: 'Hostels',
    whyMatch: ['Same dates: Jul 4–16', 'Both budget travelers', '4 of 6 interests overlap', 'Daily budget ranges overlap', 'Both prefer Ubud first'],
    itinerary: [
      ['Jul 4–7', 'Ubud', 'Yoga · rice terraces · Tegallalang', true],
      ['Jul 8–11', 'Canggu', 'Surf lessons · cafés · sunset at Echo Beach', true],
      ['Jul 12–16', 'Nusa Lembongan', 'Diving · island days', false],
    ],
  },
  rahul: {
    name: 'Rahul Mehta', age: 31, city: 'Bengaluru', score: 89,
    src: PHOTOS.rahul, verified: true, trust: 4.6, trips: 8,
    langs: ['EN', 'HI', 'KN'], travelStyle: 'Budget',
    budgetMin: 2000, budgetMax: 5000,
    bio: 'Hiking trails, beach sunsets, and hostel rooftops. Always have a backup plan but happy to ditch it.',
    interests: [['Hiking', true], ['Beaches', true], ['Photography', true], ['Slow travel', false], ['Heritage', false], ['Camping', false]],
    tripName: 'Bali, Indonesia', tripDates: 'Jul 6 — Jul 18', tripNights: 12, tripImg: PHOTOS.bali,
    tripPace: 'Active', tripStay: 'Hostels',
    whyMatch: ['Overlapping dates: Jul 6–16', 'Both budget travelers', '3 shared interests', 'Similar daily budget'],
    itinerary: [
      ['Jul 6–9', 'Ubud', 'Hiking · rice terraces', true],
      ['Jul 10–14', 'Canggu', 'Surfing · beaches', true],
      ['Jul 15–18', 'Seminyak', 'Nightlife · cafés', false],
    ],
  },
  meera: {
    name: 'Meera Iyer', age: 26, city: 'Chennai', score: 92,
    src: PHOTOS.meera, verified: true, trust: 4.9, trips: 15,
    langs: ['EN', 'HI', 'TA'], travelStyle: 'Budget',
    budgetMin: 1500, budgetMax: 3500,
    bio: 'Yoga mornings, market evenings, and quiet cafés in between. I travel slow and go deep.',
    interests: [['Yoga', true], ['Slow travel', true], ['Markets', true], ['Photography', false], ['Heritage', false], ['Cafés', true]],
    tripName: 'Bali, Indonesia', tripDates: 'Jul 5 — Jul 14', tripNights: 9, tripImg: PHOTOS.bali,
    tripPace: 'Relaxed', tripStay: 'Homestays',
    whyMatch: ['Overlapping dates: Jul 5–14', 'Both budget travelers', '3 shared interests'],
    itinerary: [
      ['Jul 5–9', 'Ubud', 'Yoga retreat · temples', true],
      ['Jul 10–14', 'Nusa Penida', 'Islands · diving', false],
    ],
  },
}

const FALLBACK = PROFILES.priya

const GALLERY_EXTRA = [PHOTOS.bali, PHOTOS.jaipur, PHOTOS.vietnam, PHOTOS.himachal]

export function ProfileDetail() {
  const { id = 'priya' } = useParams()
  const navigate = useNavigate()
  const p = PROFILES[id] ?? FALLBACK

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Left: gallery + details */}
      <div style={{ padding: '24px 32px', overflowY: 'auto' }}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.muted, marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <IconBack size={12} /> Back to results
        </button>

        {/* Gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 6, height: 360, overflow: 'hidden', borderRadius: 10 }}>
          <div style={{ borderRadius: 10, overflow: 'hidden', minHeight: 0 }}>
            <img src={p.src} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 6, minHeight: 0 }}>
            {GALLERY_EXTRA.slice(0, 2).map((src, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: 'hidden', minHeight: 0 }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 6, minHeight: 0 }}>
            <div style={{ borderRadius: 10, overflow: 'hidden', minHeight: 0 }}>
              <img src={GALLERY_EXTRA[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
              <img src={GALLERY_EXTRA[3]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700 }}>+5 more</div>
            </div>
          </div>
        </div>

        {/* Identity */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{p.name}, {p.age}</h1>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconPin size={12} /> {p.city}</span>
              {p.verified && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconShield size={12} /> Verified · Trust {p.trust} ★</span>}
              <span>{p.langs.join(' · ')}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{p.score}%</div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>interest match</div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 18, color: T.ink }}>{p.bio}</p>

        {/* Interests */}
        <div style={{ marginTop: 18 }}>
          <SectionLabel>Interests</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {p.interests.map(([t, shared]) => (
              <span key={t} style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                border: `1px solid ${shared ? T.ink : T.line}`,
                background: shared ? T.ink : 'transparent',
                color: shared ? '#fff' : T.ink,
              }}>{shared ? '● ' : ''}{t}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[['Trust', `${p.trust} ★`], ['Trips', String(p.trips)], ['Languages', String(p.langs.length)], ['Response', '< 1h']].map(([k, v]) => (
            <div key={k} style={{ padding: 12, border: `1px solid ${T.line}`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: trip sidebar */}
      <div style={{ borderLeft: `1px solid ${T.line}`, padding: 24, background: 'var(--fill-soft)', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
        <SectionLabel>Upcoming trip</SectionLabel>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.line}`, background: 'var(--bg)' }}>
          <WFImage src={p.tripImg} ratio="2/1" />
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{p.tripName}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{p.tripDates} · {p.tripNights} nights</div>
            <Rule my={10} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Style', p.travelStyle], ['₹/day', `${(p.budgetMin/1000).toFixed(1)}k–${(p.budgetMax/1000).toFixed(1)}k`], ['Pace', p.tripPace], ['Stay', p.tripStay]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why you match */}
        <div>
          <SectionLabel>Why you match</SectionLabel>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            {p.whyMatch.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: T.ink, color: '#fff', fontSize: 9, fontWeight: 800, display: 'grid', placeItems: 'center', flexShrink: 0 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary */}
        <div>
          <SectionLabel>Her plan</SectionLabel>
          <div style={{ marginTop: 10, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: T.line }} />
            {p.itinerary.map(([dates, place, what, overlap]) => (
              <div key={dates} style={{ display: 'flex', gap: 14, paddingLeft: 24, paddingBottom: 14, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 4, top: 4, width: 10, height: 10, borderRadius: 5, background: overlap ? T.ink : T.fill, border: `2px solid ${T.ink}` }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dates}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                    {place}
                    {overlap && <span style={{ marginLeft: 8, fontSize: 9, padding: '2px 6px', background: '#dceeff', color: '#0a3d91', borderRadius: 3, fontWeight: 700 }}>YOU OVERLAP</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{what}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="outline" size="lg" onClick={() => navigate(-1)}>Skip</Button>
          <div style={{ flex: 1 }}>
            <Button variant="filled" size="lg" block icon={<IconHeart size={15} />} onClick={() => navigate('/matches')}>
              Match with {p.name.split(' ')[0]}
            </Button>
          </div>
          <button
            style={{ width: 48, height: 48, borderRadius: 8, border: `1px solid ${T.line}`, background: 'transparent', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <IconMore size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
