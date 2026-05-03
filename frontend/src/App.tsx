import { CalendarDays, CheckCircle2, Heart, LogOut, MapPin, MessageCircle, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { completeOnboarding, getDiscoverProfiles, getTrips, loginUser, registerUser } from './lib/api'
import type { FormEvent, ReactNode } from 'react'
import type { AppUser, DiscoverProfile, GroupTrip, OnboardingInput } from './lib/api'

type AuthMode = 'login' | 'register'

const tokenKey = 'wandermatch_token'
const userKey = 'wandermatch_user'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) ?? '')
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem(userKey)
    return stored ? (JSON.parse(stored) as AppUser) : null
  })
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [trips, setTrips] = useState<GroupTrip[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'connected' | 'demo'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || !user?.onboardingCompleted) {
      return
    }

    setApiStatus('loading')
    Promise.all([getDiscoverProfiles(token), getTrips(token)])
      .then(([profileData, tripData]) => {
        setProfiles(profileData.length ? profileData : fallbackProfiles)
        setTrips(tripData.length ? tripData : fallbackTrips)
        setApiStatus(profileData.length ? 'connected' : 'demo')
      })
      .catch((requestError: Error) => {
        setError(requestError.message)
        setProfiles(fallbackProfiles)
        setTrips(fallbackTrips)
        setApiStatus('demo')
      })
  }, [token, user?.onboardingCompleted])

  function saveSession(nextToken: string, nextUser: AppUser) {
    localStorage.setItem(tokenKey, nextToken)
    localStorage.setItem(userKey, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
    setError('')
  }

  function logout() {
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
    setToken('')
    setUser(null)
    setProfiles([])
    setTrips([])
  }

  if (!token || !user) {
    return (
      <Shell apiStatus="idle">
        <AuthPanel onAuthenticated={saveSession} />
      </Shell>
    )
  }

  if (!user.onboardingCompleted) {
    return (
      <Shell apiStatus="connected" user={user} onLogout={logout}>
        <PreferenceOnboarding
          error={error}
          onSubmit={async (input) => {
            try {
              const updatedUser = await completeOnboarding(token, input)
              localStorage.setItem(userKey, JSON.stringify(updatedUser))
              setUser(updatedUser)
              setError('')
            } catch (requestError) {
              setError(requestError instanceof Error ? requestError.message : 'Could not save preferences')
            }
          }}
        />
      </Shell>
    )
  }

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
    <Shell apiStatus={apiStatus} user={user} onLogout={logout}>
      {error ? <div className="notice">{error}</div> : null}
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Travel buddy matching for solo travelers</p>
          <h1>Find a compatible companion before the trip starts.</h1>
          <p className="hero-text">
            Your completed preferences now drive matching by destination overlap, trip dates, travel style, interests, and daily budget.
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
          <p>Only matched users can message, share plans, and build trip context.</p>
        </article>
        <article>
          <CalendarDays />
          <h2>Trip boards</h2>
          <p>Trips stay behind login and use the travel data collected during onboarding.</p>
        </article>
        <article id="safety">
          <ShieldCheck />
          <h2>Safety-first flows</h2>
          <p>Verification, trusted contacts, reporting, and emergency check-in are protected areas.</p>
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
        Logged-in matching flow is connected to user preferences.
      </footer>
    </Shell>
  )
}

function Shell({
  apiStatus,
  children,
  user,
  onLogout
}: {
  apiStatus: 'idle' | 'loading' | 'connected' | 'demo'
  children: ReactNode
  user?: AppUser | null
  onLogout?: () => void
}) {
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
        <div className="session-actions">
          <span className={`api-pill ${apiStatus}`}>{apiStatusLabel(apiStatus)}</span>
          {user ? <span className="user-pill">{user.name}</span> : null}
          {onLogout ? (
            <button type="button" className="logout-button" onClick={onLogout}>
              <LogOut size={16} />
              Logout
            </button>
          ) : null}
        </div>
      </header>
      {children}
    </main>
  )
}

function AuthPanel({ onAuthenticated }: { onAuthenticated: (token: string, user: AppUser) => void }) {
  const [mode, setMode] = useState<AuthMode>('register')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    try {
      const dateOfBirth = String(form.get('dateOfBirth') ?? '')
      const response =
        mode === 'register'
          ? await registerUser({
              name: String(form.get('name') ?? ''),
              email: String(form.get('email') ?? ''),
              password: String(form.get('password') ?? ''),
              phone: String(form.get('phone') ?? ''),
              homeCity: String(form.get('homeCity') ?? ''),
              gender: String(form.get('gender') ?? 'prefer-not-to-say'),
              ...(dateOfBirth ? { dateOfBirth } : {})
            })
          : await loginUser({
              email: String(form.get('email') ?? ''),
              password: String(form.get('password') ?? '')
            })

      onAuthenticated(response.token, response.user)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed')
    }
  }

  return (
    <section className="auth-layout">
      <div className="hero-copy">
        <p className="eyebrow">Login required</p>
        <h1>Start with an account, then complete travel preferences.</h1>
        <p className="hero-text">
          WanderMatch does not unlock discovery, group trips, chat, or safety tools until the user is logged in and preference onboarding is complete.
        </p>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-tabs">
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
        </div>
        {error ? <div className="form-error">{error}</div> : null}
        {mode === 'register' ? (
          <>
            <label>Full name<input name="name" required minLength={2} /></label>
            <label>Phone<input name="phone" /></label>
            <label>Home city<input name="homeCity" required /></label>
            <label>Date of birth<input name="dateOfBirth" type="date" /></label>
            <label>Gender
              <select name="gender" defaultValue="prefer-not-to-say">
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </label>
          </>
        ) : null}
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required minLength={mode === 'register' ? 8 : 1} /></label>
        <button className="primary-action form-submit" type="submit">{mode === 'register' ? 'Create account' : 'Login'}</button>
      </form>
    </section>
  )
}

function PreferenceOnboarding({ error, onSubmit }: { error: string; onSubmit: (input: OnboardingInput) => Promise<void> }) {
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    await onSubmit({
      bio: String(form.get('bio') ?? ''),
      travelStyle: String(form.get('travelStyle') ?? 'budget'),
      interests: splitTags(String(form.get('interests') ?? '')),
      languages: splitTags(String(form.get('languages') ?? '')),
      budgetMin: Number(form.get('budgetMin') ?? 0),
      budgetMax: Number(form.get('budgetMax') ?? 0),
      preferredDuration: String(form.get('preferredDuration') ?? 'flexible'),
      companionPreference: String(form.get('companionPreference') ?? 'solo-buddy'),
      dreamDestinations: splitTags(String(form.get('dreamDestinations') ?? '')),
      tripPlans: [
        {
          destination: String(form.get('tripDestination') ?? ''),
          startDate: String(form.get('startDate') ?? ''),
          endDate: String(form.get('endDate') ?? '')
        }
      ]
    })
    setSaving(false)
  }

  return (
    <section className="onboarding-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Preference onboarding</p>
          <h2>Tell WanderMatch what kind of travel buddy you need.</h2>
        </div>
      </div>
      <form className="preference-form" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <label className="wide">Traveler bio<textarea name="bio" required minLength={20} defaultValue="I like planned trips with local food, safe stays, and flexible daytime activities." /></label>
        <label>Travel style
          <select name="travelStyle" defaultValue="budget">
            <option value="backpacker">Backpacker</option>
            <option value="budget">Budget</option>
            <option value="midrange">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>
        </label>
        <label>Interests<input name="interests" required defaultValue="Hiking, Food & Cuisine, Culture & History, Photography" /></label>
        <label>Languages<input name="languages" required defaultValue="English, Hindi" /></label>
        <label>Budget min per day<input name="budgetMin" type="number" required defaultValue={1500} /></label>
        <label>Budget max per day<input name="budgetMax" type="number" required defaultValue={5000} /></label>
        <label>Preferred duration
          <select name="preferredDuration" defaultValue="1-week">
            <option value="weekend">Weekend</option>
            <option value="1-week">1 week</option>
            <option value="2-weeks">2 weeks</option>
            <option value="1-month">1 month</option>
            <option value="flexible">Flexible</option>
          </select>
        </label>
        <label>Companion preference
          <select name="companionPreference" defaultValue="solo-buddy">
            <option value="solo-buddy">Solo buddy</option>
            <option value="small-group">Small group</option>
            <option value="large-group">Large group</option>
          </select>
        </label>
        <label className="wide">Dream destinations<input name="dreamDestinations" required defaultValue="Bali, Vietnam, Jaipur" /></label>
        <label>Upcoming trip destination<input name="tripDestination" required defaultValue="Bali" /></label>
        <label>Start date<input name="startDate" type="date" required /></label>
        <label>End date<input name="endDate" type="date" required /></label>
        <button className="primary-action form-submit wide" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Complete preferences and start matching'}</button>
      </form>
    </section>
  )
}

function splitTags(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function apiStatusLabel(status: 'idle' | 'loading' | 'connected' | 'demo') {
  if (status === 'connected') return 'API connected'
  if (status === 'demo') return 'Demo data'
  if (status === 'loading') return 'Loading API'
  return 'Protected app'
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
