import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, PHOTOS } from '../components/ui'
import { IconSearch, IconShield } from '../components/Icon'

const TRENDING = ['Jaipur · Jun', 'Goa · Sep', 'Meghalaya · Oct', 'Rishikesh · Aug', 'Kerala · Dec']
const TRUST_ITEMS = ['Verified IDs', 'Interest-first matching', 'Group trips & cost split', '24/7 safety check-in']

export function Landing() {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('Jaipur, Rajasthan')
  const [dates, setDates] = useState('Jun 4 - Jun 16')
  const [style, setStyle] = useState('Budget')

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img
          src={PHOTOS.jaipur}
          alt="Jaipur"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 100%)' }} />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', height: 'calc(100vh - 56px)', padding: '60px 80px',
        display: 'flex', flexDirection: 'column', color: '#fff',
        maxWidth: 1180, margin: '0 auto',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Travel buddy matching · interest-first
        </div>

        <h1
          className="ef-display"
          style={{ fontSize: 72, margin: '12px 0 0', lineHeight: 1.0, maxWidth: 720, letterSpacing: '-0.02em' }}
        >
          Who do you want next to you on the trip?
        </h1>

        <p style={{ fontSize: 16, marginTop: 18, maxWidth: 540, lineHeight: 1.5, opacity: 0.92 }}>
          We match by where you're going, when, and what you actually want to do — not gender. Skip signup until it matters.
        </p>

        {/* Trip search widget */}
        <div style={{
          marginTop: 32, background: '#fff', color: T.ink, borderRadius: 14, padding: 6,
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: 0,
          maxWidth: 820, boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        }}>
          <div style={{ padding: '10px 16px', borderRight: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Where</div>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{ fontSize: 16, fontWeight: 600, marginTop: 2, border: 'none', outline: 'none', width: '100%', background: 'transparent', color: T.ink }}
            />
          </div>
          <div style={{ padding: '10px 16px', borderRight: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>When</div>
            <input
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              style={{ fontSize: 16, fontWeight: 600, marginTop: 2, border: 'none', outline: 'none', width: '100%', background: 'transparent', color: T.ink }}
            />
          </div>
          <div style={{ padding: '10px 16px', borderRight: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Travel style</div>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={{ fontSize: 16, fontWeight: 600, marginTop: 2, border: 'none', outline: 'none', background: 'transparent', color: T.ink, width: '100%' }}
            >
              <option>Backpacker</option>
              <option>Budget</option>
              <option>Mid-range</option>
              <option>Luxury</option>
            </select>
          </div>
          <div style={{ padding: 6, display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/discover')}
              style={{
                height: '100%', padding: '0 22px', borderRadius: 10, border: 'none',
                background: T.ink, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <IconSearch size={14} /> Find buddies
            </button>
          </div>
        </div>

        {/* Trending chips */}
        <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, opacity: 0.85, marginRight: 4 }}>Trending:</span>
          {TRENDING.map((t) => (
            <span key={t} style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
            }}>{t}</span>
          ))}
        </div>

        {/* Trust items */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: 24, fontSize: 11, opacity: 0.85, flexWrap: 'wrap' }}>
          {TRUST_ITEMS.map((item) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconShield size={11} /> {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
