import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { T, PHOTOS, Bubble, DateChip, Button } from '../components/ui'
import { IconShield, IconMore, IconPlus, IconSend, IconBack, IconPin } from '../components/Icon'

const CONVERSATIONS = [
  { id: 'priya', name: 'Priya Shah', msg: 'Tegallalang walk on day 2?', time: '2m', unread: 2, src: PHOTOS.priya, trip: 'Bali · Jul 4–16', active: true },
  { id: 'rahul', name: 'Rahul Mehta', msg: 'Sent the homestay link', time: '1h', unread: 0, src: PHOTOS.rahul, trip: 'Bali · Jul 6–18' },
  { id: 'ananya', name: 'Ananya Rao', msg: 'Same dates! Bus?', time: '4h', unread: 0, src: PHOTOS.ananya, trip: 'Bali · Jul 4–10' },
  { id: 'meera', name: 'Meera Iyer', msg: 'Photo · Sukawati market', time: 'yest', unread: 1, src: PHOTOS.meera, trip: 'Vietnam · Aug 2–14' },
  { id: 'vikram', name: 'Vikram Singh', msg: 'Compare tomorrow?', time: '3d', unread: 0, src: PHOTOS.vikram, trip: 'Vietnam · Aug 2–14' },
]

const INITIAL_MESSAGES = [
  { who: 'them' as const, text: 'Hey! Saw we have the same Bali dates 🎉' },
  { who: 'them' as const, text: 'What part are you starting in?' },
  { who: 'me' as const, text: 'Hii! Starting with Ubud — 4 nights. Then Canggu for surf lessons.' },
  { who: 'them' as const, text: 'Same!! Want to do the Tegallalang walk together day 2?' },
  { who: 'me' as const, text: 'Yes definitely. Should we share Ubud stay?' },
  { who: 'them' as const, text: 'Open to it. Sending a hostel option →' },
]

const PLAN_ITEMS = [
  { type: 'event', d: 'Jul 5', title: 'Tegallalang rice walk', who: 'Priya · You', cost: null, status: 'in' },
  { type: 'stay', d: 'Jul 4–7', title: 'Onion Collective · Ubud', who: 'Priya · You', cost: '₹4,800', status: 'split-pending' },
  { type: 'event', d: 'Jul 9', title: 'Surf class @ Echo Beach', who: 'Priya', cost: '₹1,500', status: 'open' },
  { type: 'transport', d: 'Jul 8', title: 'Ubud → Canggu (van)', who: 'Priya', cost: null, status: 'open' },
]

export function ChatPage() {
  const { id = 'priya' } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [showPlan, setShowPlan] = useState(false)

  const active = CONVERSATIONS.find((c) => c.id === id) ?? CONVERSATIONS[0]
  const partner = active

  function sendMessage() {
    if (!message.trim()) return
    setMessages((prev) => [...prev, { who: 'me', text: message }])
    setMessage('')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Left: conversation list */}
      <div style={{ borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 14, borderBottom: `1px solid ${T.line}`, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
          Conversations
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {CONVERSATIONS.map((c) => {
            const isActive = c.id === id
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/chat/${c.id}`)}
                style={{
                  display: 'flex', gap: 10, padding: '10px 12px', alignItems: 'center', cursor: 'pointer',
                  background: isActive ? 'var(--fill-soft)' : 'transparent',
                  borderLeft: isActive ? `3px solid ${T.ink}` : '3px solid transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--fill-soft)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={c.src} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 10.5, color: c.unread ? T.ink : T.muted, fontWeight: c.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.msg}
                  </div>
                </div>
                {c.unread > 0 && (
                  <div style={{ width: 16, height: 16, borderRadius: 8, background: T.accent, color: '#fff', fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {c.unread}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Center: chat thread */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={partner.src} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              {partner.name} <IconShield size={11} />
            </div>
            <div style={{ fontSize: 10.5, color: T.muted }}>Online · {partner.trip}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button
              onClick={() => setShowPlan(!showPlan)}
              style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${T.line}`, background: showPlan ? T.ink : 'transparent', color: showPlan ? '#fff' : T.ink, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
            >
              Plan · {PLAN_ITEMS.length}
            </button>
            <button style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.line}`, background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <IconMore size={15} />
            </button>
          </div>
        </div>

        {/* Match banner */}
        <div style={{ margin: '10px 18px 0', padding: 10, borderRadius: 10, background: 'var(--fill-soft)', border: `1px solid ${T.line}`, fontSize: 11, color: T.muted, textAlign: 'center' }}>
          ✦ You matched 2 days ago — both going to Bali · 94% interest match
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {messages.map((m, i) => <Bubble key={i} who={m.who}>{m.text}</Bubble>)}

          {/* Hostel card */}
          <div style={{ alignSelf: 'flex-start', maxWidth: 300, border: `1px solid ${T.line}`, borderRadius: 14, overflow: 'hidden', background: 'var(--bg)' }}>
            <img src={PHOTOS.bali} alt="" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase' }}>Hostel · Ubud</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>The Onion Collective</div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>4.7 ★ · ₹1,200 / night · twin room</div>
            </div>
          </div>

          <DateChip>10:42 AM</DateChip>
        </div>

        {/* Composer */}
        <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${T.line}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, paddingBottom: 8 }}>
            {['+ Plan', '₹ Cost split', '📍 Pin location', '📷 Photo'].map((t) => (
              <span key={t} style={{ padding: '5px 10px', borderRadius: 999, border: `1px solid ${T.line}`, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${T.line}`, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <IconPlus size={15} />
            </div>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Message ${partner.name.split(' ')[0]}…`}
              style={{ flex: 1, height: 38, padding: '0 14px', borderRadius: 19, border: `1px solid ${T.line}`, fontSize: 12.5, color: T.ink, outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              style={{ height: 38, padding: '0 14px', borderRadius: 8, background: T.ink, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600 }}
            >
              <IconSend size={13} /> Send
            </button>
          </div>
        </div>
      </div>

      {/* Right: profile sidebar */}
      <div style={{ borderLeft: `1px solid ${T.line}`, padding: 16, background: 'var(--fill-soft)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}>
          <img src={partner.src} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{partner.name.split(' ')[0]}, 27</div>
          <div style={{ fontSize: 11, color: T.muted }}>Mumbai · 94% match</div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Shared interests</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['Food walks', 'Hostels', 'Photography', 'Slow travel'].map((t) => (
              <span key={t} style={{ fontSize: 10, padding: '3px 7px', borderRadius: 999, background: T.ink, color: '#fff', fontWeight: 500 }}>● {t}</span>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Trip in common</div>
          <div style={{ padding: 10, borderRadius: 8, border: `1px solid ${T.line}`, background: 'var(--bg)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><IconPin size={12} /> Bali</div>
            <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2 }}>Jul 4 — 16 · 12 nights</div>
          </div>
        </div>

        {/* Plan rail (shown when toggled) */}
        {showPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trip plan · Bali</div>
            {PLAN_ITEMS.map((p, i) => (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: 8, padding: 10, border: `1px solid ${T.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>{p.type} · {p.d}</span>
                  {p.status === 'in' && <span style={{ fontSize: 8, padding: '1px 5px', background: T.ink, color: '#fff', borderRadius: 3, fontWeight: 700 }}>YOU'RE IN</span>}
                  {p.status === 'split-pending' && <span style={{ fontSize: 8, padding: '1px 5px', background: '#fff4b8', color: '#7a5a10', borderRadius: 3, fontWeight: 700 }}>SPLIT PENDING</span>}
                  {p.status === 'open' && <span style={{ fontSize: 8, padding: '1px 5px', background: 'var(--fill)', color: T.muted, borderRadius: 3, fontWeight: 700 }}>OPEN</span>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{p.title}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{p.who}{p.cost ? ` · ${p.cost}` : ''}</div>
                {p.status === 'open' && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    <span style={{ padding: '3px 8px', borderRadius: 999, background: T.ink, color: '#fff', fontSize: 9.5, fontWeight: 700, cursor: 'pointer' }}>I'm in</span>
                    <span style={{ padding: '3px 8px', borderRadius: 999, border: `1px solid ${T.line}`, fontSize: 9.5, fontWeight: 600, cursor: 'pointer' }}>Skip</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" block onClick={() => navigate(`/profile/${partner.id}`)}>
          View full profile
        </Button>

        <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, border: `1px dashed ${T.line}`, fontSize: 10.5, color: T.muted, lineHeight: 1.45 }}>
          Safety: report or unmatch from the ··· menu. Share live location only inside trip plans.
        </div>
      </div>
    </div>
  )
}
