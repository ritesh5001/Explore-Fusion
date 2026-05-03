import { CalendarDays, CheckCircle2, Heart, MapPin, MessageCircle, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { getDiscoverProfiles, getTrips } from './lib/api'
import type { DiscoverProfile, GroupTrip } from './lib/api'

function App() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [trips, setTrips] = useState<GroupTrip[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'demo'>('loading')

  useEffect(() => {
    Promise.all([getDiscoverProfiles(), getTrips()])
      .then(([profileData, tripData]) => {
        setProfiles(profileData)
        setTrips(tripData)
        setApiStatus('connected')
      })
      .catch(() => {
        setProfiles(fallbackProfiles)
        setTrips(fallbackTrips)
        setApiStatus('demo')
      })
  }, [])

  const activeProfile = profiles[activeIndex] ?? profiles[0]

  const stats = useMemo(
    () => [
      { label: 'compatibility', value: activeProfile ? `${activeProfile.compatibilityScore}%` : '--' },
      { label: 'trust score', value: activeProfile ? activeProfile.trustScore.toFixed(1) : '--' },
      { label: 'daily budget', value: activeProfile ? `INR ${activeProfile.budgetMin}-${activeProfile.budgetMax}` : '--' }
    ],
    [activeProfile]
  )

  function nextProfile() {
    setActiveIndex((current) => (profiles.length ? (current + 1) % profiles.length : 0))
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">W</span>
          <span>WanderMatch</span>
        </div>
        <nav className="nav-links" aria-label="Primary">
          <a href="#discover">Discover</a>
          <a href="#trips">Trips</a>
          <a href="#safety">Safety</a>
        </nav>
        <span className={`api-pill ${apiStatus}`}>{apiStatus === 'connected' ? 'API connected' : apiStatus === 'demo' ? 'Demo data' : 'Loading API'}</span>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Travel buddy matching for solo travelers</p>
          <h1>Find a compatible companion before the trip starts.</h1>
          <p className="hero-text">
            Swipe through verified travelers by destination, dates, style, budget, and shared interests. Matches unlock chat, shared planning, and safety tools.
          </p>
          <div className="hero-actions">
            <a href="#discover" className="primary-action">
              <Sparkles size={18} />
              Start discovery
            </a>
            <a href="#trips" className="secondary-action">
              <Users size={18} />
              Browse groups
            </a>
          </div>
        </div>

        <section className="phone-preview" id="discover" aria-label="Swipe discovery preview">
          {activeProfile ? (
            <>
              <div className="profile-card">
                <div className="profile-photo">
                  <span>{activeProfile.name.slice(0, 1)}</span>
                </div>
                <div className="score-badge">{activeProfile.compatibilityScore}% match</div>
                <h2>{activeProfile.name}{activeProfile.age ? `, ${activeProfile.age}` : ''}</h2>
                <p className="location"><MapPin size={16} />{activeProfile.homeCity ?? 'Traveler'}</p>
                <p className="bio">{activeProfile.bio}</p>
                <div className="tag-row">
                  {activeProfile.interests.slice(0, 4).map((interest) => (
                    <span key={interest}>{interest}</span>
                  ))}
                </div>
              </div>
              <div className="swipe-actions">
                <button type="button" onClick={nextProfile} aria-label="Skip profile">Skip</button>
                <button type="button" onClick={nextProfile} className="like-button" aria-label="Like profile">
                  <Heart size={20} fill="currentColor" />
                </button>
                <button type="button" onClick={nextProfile} aria-label="Super like profile">Star</button>
              </div>
            </>
          ) : (
            <div className="empty-state">Loading matches...</div>
          )}
        </section>
      </section>

      <section className="stats-grid" aria-label="Selected profile metrics">
        {stats.map((stat) => (
          <div className="metric" key={stat.label}>
            <span>{stat.value}</span>
            <p>{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="feature-grid">
        <article>
          <MessageCircle />
          <h2>Real-time chat</h2>
          <p>Matched users can message, share plans, and build trip context in one conversation.</p>
        </article>
        <article>
          <CalendarDays />
          <h2>Trip boards</h2>
          <p>Shared itineraries track destinations, dates, booking tasks, and expenses.</p>
        </article>
        <article id="safety">
          <ShieldCheck />
          <h2>Safety-first flows</h2>
          <p>Verification, trusted contacts, reporting, and emergency check-in are modeled from day one.</p>
        </article>
      </section>

      <section className="trip-section" id="trips">
        <div className="section-heading">
          <p className="eyebrow">Group trips</p>
          <h2>Open plans travelers can request to join</h2>
        </div>
        <div className="trip-list">
          {trips.map((trip) => (
            <article className="trip-item" key={trip.id ?? trip._id ?? trip.destination}>
              <div>
                <h3>{trip.destination}</h3>
                <p>{trip.dates ?? formatDateRange(trip.startDate, trip.endDate)}</p>
              </div>
              <div className="trip-meta">
                <span>{trip.members ?? 1}/{trip.maxMembers}</span>
                <span>{trip.status}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <CheckCircle2 size={18} />
        MERN web, Express API, and React Native mobile foundations are ready for feature work.
      </footer>
    </main>
  )
}

function formatDateRange(start?: string, end?: string) {
  if (!start || !end) {
    return 'Dates coming soon'
  }

  return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`
}

const fallbackProfiles: DiscoverProfile[] = [
  {
    id: 'fallback-priya',
    name: 'Priya Shah',
    age: 27,
    homeCity: 'Mumbai',
    bio: 'Food walks, old city lanes, slow mornings, and clean hostels.',
    travelStyle: 'budget',
    interests: ['Food & Cuisine', 'Culture & History', 'Photography'],
    languages: ['English', 'Hindi', 'Gujarati'],
    budgetMin: 1800,
    budgetMax: 4200,
    dreamDestinations: ['Bali', 'Vietnam', 'Jaipur'],
    upcomingTrip: 'Jaipur, Jun 12-18',
    isVerified: true,
    trustScore: 4.8,
    compatibilityScore: 94
  }
]

const fallbackTrips: GroupTrip[] = [
  {
    id: 'fallback-bali',
    destination: 'Bali, Indonesia',
    dates: 'Jul 4-16',
    members: 3,
    maxMembers: 5,
    status: 'planning'
  }
]

export default App
