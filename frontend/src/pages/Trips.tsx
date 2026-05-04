import { useEffect, useState } from 'react'
import { T, Button } from '../components/ui'
import { IconPlus, IconPin, IconCal } from '../components/Icon'
import { createTrip, getTrips, joinTrip } from '../lib/api'
import type { GroupTrip } from '../lib/api'

export function Trips({ token }: { token: string }) {
  const [trips, setTrips] = useState<GroupTrip[]>([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setTrips(await getTrips(token))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load trips')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await createTrip(token, {
        destination: String(form.get('destination') ?? ''),
        startDate: String(form.get('startDate') ?? ''),
        endDate: String(form.get('endDate') ?? ''),
        tripType: 'group',
        maxMembers: Number(form.get('maxMembers') ?? 4),
      })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create trip')
    }
  }

  async function join(id?: string) {
    if (!id) return
    try {
      await joinTrip(token, id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join trip')
    }
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Group trips</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '6px 0 0' }}>Real trips from travelers</h1>
          <p style={{ fontSize: 14, color: T.muted, marginTop: 6 }}>Create a group trip or request to join an existing one.</p>
        </div>
        <Button variant="filled" size="md" icon={<IconPlus size={13} />} onClick={() => setShowForm(!showForm)}>Create a trip</Button>
      </div>

      {error && <Notice>{error}</Notice>}
      {showForm && <CreateTripForm onSubmit={submit} />}
      {loading && <Empty label="Loading trips..." />}
      {!loading && !trips.length && <Empty label="No trips yet. Create the first group trip." />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {trips.map((trip) => {
          const id = trip._id ?? trip.id
          const members = Array.isArray(trip.members) ? trip.members.length : trip.members ?? 0
          return (
            <div key={id ?? trip.destination} style={{ borderRadius: 10, border: `1px solid ${T.line}`, background: 'var(--bg)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{trip.destination}</div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: T.muted, marginTop: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCal size={12} /> {formatDateRange(trip.startDate, trip.endDate) || trip.dates}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconPin size={12} /> {trip.status}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: T.muted, fontWeight: 800 }}>{members}/{trip.maxMembers}</div>
              </div>
              <Button variant="filled" size="sm" style={{ marginTop: 16 }} onClick={() => void join(id)}>Request to join</Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CreateTripForm({ onSubmit }: { onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px auto', gap: 10, marginBottom: 18, padding: 14, border: `1px solid ${T.line}`, borderRadius: 10, background: 'var(--bg)' }}>
      <input name="destination" placeholder="Destination" required style={inputStyle} />
      <input name="startDate" type="date" required style={inputStyle} />
      <input name="endDate" type="date" required style={inputStyle} />
      <input name="maxMembers" type="number" min={2} max={20} defaultValue={4} required style={inputStyle} />
      <Button type="submit" variant="filled">Create</Button>
    </form>
  )
}

function formatDateRange(start?: string, end?: string) {
  if (!start || !end) return ''
  return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`
}

const inputStyle: React.CSSProperties = { height: 38, padding: '0 12px', border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 13 }

function Notice({ children }: { children: string }) {
  return <div style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#fff0e9', border: '1px solid #efb49f', color: '#7a2c19', fontSize: 13, fontWeight: 700 }}>{children}</div>
}

function Empty({ label }: { label: string }) {
  return <div style={{ padding: 48, border: `1px dashed ${T.line}`, borderRadius: 10, color: T.muted, textAlign: 'center' }}>{label}</div>
}
