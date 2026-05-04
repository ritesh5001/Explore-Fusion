import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Shell, MinimalShell } from './components/Shell'
import { Landing } from './pages/Landing'
import { AuthPage } from './pages/Auth'
import { OnboardingFlow } from './pages/OnboardingFlow'
import { Discover } from './pages/Discover'
import { ProfileDetail } from './pages/Profile'
import { Matches } from './pages/Matches'
import { ChatPage } from './pages/Chat'
import { Trips } from './pages/Trips'
import type { AppUser } from './lib/api'

const TOKEN_KEY = 'ef_token'
const USER_KEY = 'ef_user'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '')
  const [user, setUser] = useState<AppUser | null>(() => {
    const s = localStorage.getItem(USER_KEY)
    return s ? (JSON.parse(s) as AppUser) : null
  })

  function saveSession(t: string, u: AppUser) {
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken('')
    setUser(null)
  }

  function updateUser(u: AppUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
  }

  const isAuthed = Boolean(token && user)
  const needsOnboarding = isAuthed && !user?.onboardingCompleted

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing */}
        <Route path="/" element={
          <MinimalShell>
            <Landing />
          </MinimalShell>
        } />

        {/* Auth */}
        <Route path="/auth" element={
          isAuthed && !needsOnboarding
            ? <Navigate to="/discover" replace />
            : <MinimalShell><AuthPage onAuthenticated={saveSession} /></MinimalShell>
        } />

        {/* Onboarding */}
        <Route path="/onboarding" element={
          !isAuthed
            ? <Navigate to="/auth" replace />
            : <MinimalShell><OnboardingFlow token={token} onComplete={updateUser} /></MinimalShell>
        } />

        {/* Authenticated app shell routes */}
        <Route path="/discover" element={
          needsOnboarding
            ? <Navigate to="/onboarding" replace />
            : <Shell user={user} onLogout={logout}><Discover /></Shell>
        } />

        <Route path="/profile/:id" element={
          needsOnboarding
            ? <Navigate to="/onboarding" replace />
            : <Shell user={user} onLogout={logout}><ProfileDetail /></Shell>
        } />

        <Route path="/matches" element={
          needsOnboarding
            ? <Navigate to="/onboarding" replace />
            : <Shell user={user} onLogout={logout}><Matches /></Shell>
        } />

        <Route path="/trips" element={
          needsOnboarding
            ? <Navigate to="/onboarding" replace />
            : <Shell user={user} onLogout={logout}><Trips /></Shell>
        } />

        <Route path="/chat" element={
          needsOnboarding
            ? <Navigate to="/onboarding" replace />
            : <Shell user={user} onLogout={logout}><ChatPage /></Shell>
        } />

        <Route path="/chat/:id" element={
          needsOnboarding
            ? <Navigate to="/onboarding" replace />
            : <Shell user={user} onLogout={logout}><ChatPage /></Shell>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
