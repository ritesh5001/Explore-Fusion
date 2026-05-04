import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { T, PHOTOS } from '../components/ui'
import { Button } from '../components/ui'
import { registerUser, loginUser } from '../lib/api'
import type { AppUser } from '../lib/api'

interface AuthPageProps {
  onAuthenticated: (token: string, user: AppUser) => void
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'register' | 'login'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setLoading(true)
    setError('')
    try {
      const res = mode === 'register'
        ? await registerUser({
            name: String(form.get('name') ?? ''),
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? ''),
            phone: String(form.get('phone') ?? ''),
            homeCity: String(form.get('homeCity') ?? ''),
            gender: String(form.get('gender') ?? 'prefer-not-to-say'),
          })
        : await loginUser({
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? ''),
          })
      onAuthenticated(res.token, res.user)
      navigate(res.user.onboardingCompleted ? '/discover' : '/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', minHeight: 'calc(100vh - 56px)' }}>
      {/* Left: hero */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={PHOTOS.vietnam} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
          <h1 className="ef-display" style={{ fontSize: 52, margin: 0, lineHeight: 1.1, maxWidth: 480 }}>
            Find someone who travels like you do.
          </h1>
          <p style={{ fontSize: 15, marginTop: 16, opacity: 0.9, lineHeight: 1.55, maxWidth: 420 }}>
            Interest-first matching for Indian travelers. We look at what you do on a trip, not who you are.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div style={{ background: 'var(--fill-soft, #f5f5f5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          {mode === 'register' ? 'Create account' : 'Welcome back'}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 28px', lineHeight: 1.2 }}>
          {mode === 'register' ? 'Start finding travel buddies' : 'Log in to Explore Fusion'}
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: T.fill, borderRadius: 8 }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                flex: 1, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 12.5,
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? T.ink : T.muted,
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >{m === 'login' ? 'Login' : 'Register'}</button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ padding: 12, borderRadius: 8, background: '#fff0e9', border: '1px solid #efb49f', color: '#7a2c19', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <Field label="Full name" name="name" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Home city" name="homeCity" required />
                <Field label="Phone" name="phone" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Gender</div>
                <select name="gender" style={inputStyle}>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </>
          )}

          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />

          <Button type="submit" variant="filled" size="lg" block disabled={loading}>
            {loading ? 'Please wait…' : mode === 'register' ? 'Create account →' : 'Log in →'}
          </Button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: T.muted }}>
          {mode === 'register'
            ? <>Already have an account? <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: T.ink, fontWeight: 700, cursor: 'pointer', fontSize: 12, padding: 0 }}>Login</button></>
            : <>New here? <button type="button" onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: T.ink, fontWeight: 700, cursor: 'pointer', fontSize: 12, padding: 0 }}>Create account</button></>
          }
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px',
  border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 13,
  color: T.ink, background: '#fff', outline: 'none',
}

function Field({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
      <input name={name} type={type} required={required} style={inputStyle} />
    </div>
  )
}
