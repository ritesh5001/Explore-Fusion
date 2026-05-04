import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, PHOTOS, WFImage, Chip, Button, SectionLabel } from '../components/ui'
import { IconPin, IconShield, IconSliders } from '../components/Icon'

const BUDDY_CARDS = [
  { id: 'priya', name: 'Priya Shah', age: 27, city: 'Mumbai', score: 94, src: PHOTOS.priya, tags: ['Food walks', 'Hostels', 'Photography'], when: 'Bali · Jul 4–16', verified: true },
  { id: 'rahul', name: 'Rahul Mehta', age: 31, city: 'Bengaluru', score: 89, src: PHOTOS.rahul, tags: ['Hiking', 'Beaches', 'Photography'], when: 'Bali · Jul 6–18', verified: true },
  { id: 'ananya', name: 'Ananya Rao', age: 24, city: 'Delhi', score: 81, src: PHOTOS.ananya, tags: ['Temples', 'Markets'], when: 'Bali · Jul 4–10', verified: false },
  { id: 'arjun', name: 'Arjun Nair', age: 29, city: 'Pune', score: 78, src: PHOTOS.arjun, tags: ['Surfing', 'Cafés'], when: 'Bali · Jul 8–20', verified: true },
  { id: 'meera', name: 'Meera Iyer', age: 26, city: 'Chennai', score: 92, src: PHOTOS.meera, tags: ['Yoga', 'Slow travel'], when: 'Bali · Jul 5–14', verified: true },
  { id: 'vikram', name: 'Vikram Singh', age: 33, city: 'Jaipur', score: 76, src: PHOTOS.vikram, tags: ['Heritage', 'Photography'], when: 'Bali · Jul 4–12', verified: false },
]

const TRAVEL_STYLES = ['Backpacker', 'Budget', 'Mid', 'Luxury']
const ACTIVE_INTERESTS = ['Food walks', 'Hostels', 'Photography', 'Hiking']

export function Discover() {
  const navigate = useNavigate()
  const [activeStyle, setActiveStyle] = useState('Budget')
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const [sortBy, setSortBy] = useState<'match' | 'recent' | 'verified'>('match')

  const filtered = BUDDY_CARDS.filter(c => !verifiedOnly || c.verified)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Filter sidebar */}
      <aside style={{ borderRight: `1px solid ${T.line}`, padding: 20, overflowY: 'auto', background: 'var(--fill-soft)' }}>
        <SectionLabel>Filters</SectionLabel>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Destination */}
          <FilterField label="Destination" value="Bali, Indonesia" />
          <FilterField label="Dates" value="Jul 4 — Jul 16" />

          {/* Travel style */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Travel style</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {TRAVEL_STYLES.map((s) => (
                <span key={s} onClick={() => setActiveStyle(s)} style={{
                  padding: '4px 9px', fontSize: 11, fontWeight: 600, borderRadius: 999, cursor: 'pointer',
                  border: `1px solid ${s === activeStyle ? T.ink : T.line}`,
                  background: s === activeStyle ? T.ink : 'transparent',
                  color: s === activeStyle ? '#fff' : T.ink,
                }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Budget range */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Budget / day (₹)</div>
            <div style={{ height: 36, padding: '0 10px', border: `1px solid ${T.line}`, borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
              <span>1,500</span>
              <div style={{ flex: 1, margin: '0 10px', height: 4, background: T.fill, borderRadius: 2, position: 'relative' }}>
                <div style={{ position: 'absolute', left: '15%', right: '40%', height: '100%', background: T.ink, borderRadius: 2 }} />
              </div>
              <span>5,000</span>
            </div>
          </div>

          {/* Interests */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>My interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {ACTIVE_INTERESTS.map((t) => (
                <span key={t} style={{ padding: '4px 9px', fontSize: 11, fontWeight: 500, borderRadius: 999, background: T.ink, color: '#fff' }}>● {t}</span>
              ))}
              <span style={{ padding: '4px 9px', fontSize: 11, fontWeight: 500, borderRadius: 999, border: `1px solid ${T.line}`, color: T.muted, cursor: 'pointer' }}>+ add</span>
            </div>
          </div>

          {/* Verified toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: 11.5 }}>
            <span style={{ fontWeight: 600 }}>Verified only</span>
            <div
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              style={{ width: 32, height: 18, borderRadius: 9, background: verifiedOnly ? T.ink : T.fill, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              <div style={{ position: 'absolute', top: 2, right: verifiedOnly ? 2 : undefined, left: verifiedOnly ? undefined : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>47 buddies headed to Bali</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Jul 4 — Jul 16 · sorted by interest match</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['match', 'recent', 'verified'] as const).map((s) => (
              <span key={s} onClick={() => setSortBy(s)} style={{
                padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: 'pointer',
                background: sortBy === s ? T.fill : 'transparent',
                color: sortBy === s ? T.ink : T.muted,
              }}>{s === 'match' ? 'Match %' : s.charAt(0).toUpperCase() + s.slice(1)}</span>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/profile/${c.id}`)}
              style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.line}`, background: 'var(--bg)', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ position: 'relative' }}>
                <WFImage src={c.src} ratio="4/5" />
                {/* Match badge */}
                <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                  {c.score}% match
                </div>
                {/* Identity overlay */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, padding: '32px 10px 10px', color: '#fff',
                  background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}, {c.age}</div>
                  <div style={{ fontSize: 10.5, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    {c.verified && <><IconShield size={10} /> Verified · </>}<IconPin size={10} /> {c.city}
                  </div>
                </div>
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 10.5, color: T.muted, marginBottom: 6 }}>{c.when}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {c.tags.map((t) => <Chip key={t} small>{t}</Chip>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted }}>
            <IconSliders size={32} />
            <div style={{ marginTop: 12, fontWeight: 600 }}>No buddies match your filters</div>
            <Button variant="outline" size="md" style={{ marginTop: 12 }} onClick={() => setVerifiedOnly(false)}>
              Remove verified filter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
      <div style={{ height: 36, padding: '0 10px', border: `1px solid ${T.line}`, borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', color: T.ink, background: 'var(--bg)' }}>
        {value}
      </div>
    </div>
  )
}
