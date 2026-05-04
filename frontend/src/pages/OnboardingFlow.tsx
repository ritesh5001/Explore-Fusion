import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, Button, Rule } from '../components/ui'
import { IconCheck } from '../components/Icon'
import { completeOnboarding, getDestinations } from '../lib/api'
import type { AppUser } from '../lib/api'

const STEPS = ['Account', 'Travel style', 'Interests', 'Trip dates', 'Photos & verification']

const INTEREST_CATEGORIES: Array<[string, string[]]> = [
  ['Pace & vibe', ['Slow travel', 'Backpacking', 'Luxury', 'Spontaneous', 'Planned-out']],
  ['Things to do', ['Food walks', 'Hiking', 'Trekking', 'Surfing', 'Beach', 'Diving', 'Cycling', 'Yoga']],
  ['Culture', ['Heritage', 'Temples', 'Markets', 'Festivals', 'Photography', 'Music gigs']],
  ['Stay', ['Hostels', 'Homestays', 'Boutique hotels', 'Airbnb', 'Camping']],
]

const TRAVEL_STYLES = ['Backpacker', 'Budget', 'Mid-range', 'Luxury']
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada']

interface OnboardingFlowProps {
  token: string
  onComplete: (user: AppUser) => void
}

export function OnboardingFlow({ token, onComplete }: OnboardingFlowProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState(2) // start at step 3 (Interests) per wireframe
  const [travelStyle, setTravelStyle] = useState('Budget')
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set(['Slow travel', 'Food walks', 'Hiking', 'Photography', 'Heritage', 'Markets', 'Hostels']))
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(new Set(['English', 'Hindi']))
  const [bio, setBio] = useState('')
  const [destination, setDestination] = useState('')
  const [destinationOptions, setDestinationOptions] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budgetMin, setBudgetMin] = useState(1500)
  const [budgetMax, setBudgetMax] = useState(5000)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    getDestinations()
      .then((destinations) => {
        if (cancelled) {
          return
        }

        setDestinationOptions(destinations)
        setDestination((current) => current || destinations[0] || '')
      })
      .catch(() => {
        if (!cancelled) {
          setDestinationOptions([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  function toggleInterest(tag: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  function toggleLang(lang: string) {
    setSelectedLangs((prev) => {
      const next = new Set(prev)
      next.has(lang) ? next.delete(lang) : next.add(lang)
      return next
    })
  }

  async function finish() {
    setSaving(true)
    setError('')
    try {
      const updated = await completeOnboarding(token, {
        bio: bio || 'Looking for a travel buddy who shares my interests.',
        travelStyle: travelStyle.toLowerCase(),
        interests: Array.from(selectedInterests),
        languages: Array.from(selectedLangs),
        budgetMin,
        budgetMax,
        preferredDuration: '1-week',
        companionPreference: 'solo-buddy',
        dreamDestinations: [destination],
        tripPlans: startDate && endDate
          ? [{ destination, startDate, endDate }]
          : [],
      })
      onComplete(updated)
      navigate('/discover')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 'calc(100vh - 56px)' }}>
      {/* Left: stepper */}
      <div style={{ borderRight: `1px solid ${T.line}`, padding: 28, background: 'var(--fill-soft)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Set up your travel profile
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, lineHeight: 1.2 }}>
          5 steps to find your travel buddy
        </div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {STEPS.map((label, i) => {
            const done = i < step
            const now = i === step
            return (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  background: done ? T.ink : (now ? 'var(--bg)' : T.fill),
                  border: now ? `2px solid ${T.ink}` : 'none',
                  color: done ? '#fff' : T.ink,
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>
                  {done ? <IconCheck size={11} /> : i + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: now ? 700 : 500, color: done ? T.muted : T.ink }}>{label}</div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 'auto', fontSize: 11, color: T.muted, padding: 12, border: `1px dashed ${T.line}`, borderRadius: 8 }}>
          We never match by gender alone. Compatibility is interest-first.
        </div>
      </div>

      {/* Right: step content */}
      <div style={{ padding: 40, overflowY: 'auto' }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Step {step + 1} of {STEPS.length}
          </div>

          {step === 1 && <StepTravelStyle travelStyle={travelStyle} setTravelStyle={setTravelStyle} selectedLangs={selectedLangs} toggleLang={toggleLang} bio={bio} setBio={setBio} />}
          {step === 2 && <StepInterests selectedInterests={selectedInterests} toggleInterest={toggleInterest} />}
          {step === 3 && <StepTripDates destination={destination} setDestination={setDestination} destinationOptions={destinationOptions} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} budgetMin={budgetMin} setBudgetMin={setBudgetMin} budgetMax={budgetMax} setBudgetMax={setBudgetMax} />}

          {error && <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#fff0e9', border: '1px solid #efb49f', color: '#7a2c19', fontSize: 13 }}>{error}</div>}

          <div style={{ marginTop: 32, display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button variant="ghost" size="lg" onClick={() => step > 0 && setStep(s => s - 1)}>Back</Button>
            <div style={{ flex: 1 }} />
            {step === 2 && (
              <span style={{ fontSize: 11.5, color: T.muted }}>{selectedInterests.size} selected · pick min 5</span>
            )}
            {step < STEPS.length - 1 ? (
              <Button variant="filled" size="lg" onClick={() => setStep(s => s + 1)}>Continue →</Button>
            ) : (
              <Button variant="filled" size="lg" onClick={finish} disabled={saving}>
                {saving ? 'Saving…' : 'Finish & start matching →'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepTravelStyle({
  travelStyle, setTravelStyle,
  selectedLangs, toggleLang,
  bio, setBio,
}: {
  travelStyle: string; setTravelStyle: (s: string) => void
  selectedLangs: Set<string>; toggleLang: (l: string) => void
  bio: string; setBio: (b: string) => void
}) {
  return (
    <>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: '6px 0 0', lineHeight: 1.15 }}>How do you like to travel?</h1>
      <p style={{ fontSize: 14, color: T.muted, margin: '8px 0 0' }}>This helps us find buddies at a similar comfort level.</p>
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Travel style</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {TRAVEL_STYLES.map((s) => (
            <span key={s} onClick={() => setTravelStyle(s)} style={{
              padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${s === travelStyle ? T.ink : T.line}`,
              background: s === travelStyle ? T.ink : 'transparent',
              color: s === travelStyle ? '#fff' : T.ink,
            }}>{s}</span>
          ))}
        </div>
      </div>
      <Rule my={24} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Languages you speak</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {LANGUAGES.map((l) => (
            <span key={l} onClick={() => toggleLang(l)} style={{
              padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${selectedLangs.has(l) ? T.ink : T.line}`,
              background: selectedLangs.has(l) ? T.ink : 'transparent',
              color: selectedLangs.has(l) ? '#fff' : T.ink,
            }}>{l}</span>
          ))}
        </div>
      </div>
      <Rule my={24} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Short bio (optional)</div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Food walks, old city lanes, slow mornings…"
          rows={3}
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 13, color: T.ink, resize: 'vertical', outline: 'none' }}
        />
      </div>
    </>
  )
}

function StepInterests({ selectedInterests, toggleInterest }: { selectedInterests: Set<string>; toggleInterest: (t: string) => void }) {
  return (
    <>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: '6px 0 0', lineHeight: 1.15 }}>What lights you up on a trip?</h1>
      <p style={{ fontSize: 14, color: T.muted, margin: '8px 0 0' }}>Pick 5–12. We use these to find buddies who'd actually enjoy the same things.</p>
      <div style={{ marginTop: 24 }}>
        {INTEREST_CATEGORIES.map(([cat, tags]) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{cat}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map((t) => {
                const on = selectedInterests.has(t)
                return (
                  <span key={t} onClick={() => toggleInterest(t)} style={{
                    padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    border: `1px solid ${on ? T.ink : T.line}`,
                    background: on ? T.ink : 'transparent',
                    color: on ? '#fff' : T.ink,
                  }}>{t}</span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function StepTripDates({
  destination, setDestination,
  destinationOptions,
  startDate, setStartDate,
  endDate, setEndDate,
  budgetMin, setBudgetMin,
  budgetMax, setBudgetMax,
}: {
  destination: string; setDestination: (v: string) => void
  destinationOptions: string[]
  startDate: string; setStartDate: (v: string) => void
  endDate: string; setEndDate: (v: string) => void
  budgetMin: number; setBudgetMin: (v: number) => void
  budgetMax: number; setBudgetMax: (v: number) => void
}) {
  const fieldStyle: React.CSSProperties = { width: '100%', height: 40, padding: '0 12px', border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 13, color: T.ink, outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }

  return (
    <>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: '6px 0 0', lineHeight: 1.15 }}>Where & when is your next trip?</h1>
      <p style={{ fontSize: 14, color: T.muted, margin: '8px 0 0' }}>Your trip plan is how we find overlapping buddies.</p>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Destination</label>
          <input
            list="indian-destinations"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={fieldStyle}
            placeholder="Select an Indian destination"
          />
          <datalist id="indian-destinations">
            {destinationOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Start date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>End date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={fieldStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Daily budget (₹)</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>Min</div>
              <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(Number(e.target.value))} style={fieldStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>Max</div>
              <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))} style={fieldStyle} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
