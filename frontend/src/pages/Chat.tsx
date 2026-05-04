import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { T, Bubble, Button } from '../components/ui'
import { IconSend } from '../components/Icon'
import { getMatches, getMessages, sendChatMessage } from '../lib/api'
import type { MatchRecord, MatchUser, MessageRecord } from '../lib/api'

export function ChatPage({ token, currentUserId }: { token: string; currentUserId: string }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<MatchRecord[]>([])
  const [messages, setMessages] = useState<MessageRecord[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const activeMatch = matches.find((match) => match._id === id) ?? matches[0]
  const partner = activeMatch ? getPartner(activeMatch, currentUserId) : undefined

  useEffect(() => {
    getMatches(token)
      .then((nextMatches) => {
        setMatches(nextMatches)
        if (!id && nextMatches[0]) {
          navigate(`/chat/${nextMatches[0]._id}`, { replace: true })
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load matches'))
  }, [token, id, navigate])

  useEffect(() => {
    if (!activeMatch?._id) {
      setMessages([])
      return
    }

    getMessages(token, activeMatch._id)
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load messages'))
  }, [token, activeMatch?._id])

  async function sendMessage() {
    if (!activeMatch || !message.trim()) return
    try {
      const sent = await sendChatMessage(token, activeMatch._id, message.trim())
      setMessages((current) => [...current, sent])
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <div style={{ borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 14, borderBottom: `1px solid ${T.line}`, fontSize: 14, fontWeight: 700 }}>Conversations</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {matches.map((match) => {
            const itemPartner = getPartner(match, currentUserId)
            const active = match._id === activeMatch?._id
            return (
              <button key={match._id} onClick={() => navigate(`/chat/${match._id}`)} style={{ width: '100%', display: 'flex', gap: 10, padding: '10px 12px', alignItems: 'center', cursor: 'pointer', background: active ? 'var(--fill-soft)' : 'transparent', border: 'none', borderLeft: active ? `3px solid ${T.ink}` : '3px solid transparent', textAlign: 'left' }}>
                <Avatar user={itemPartner} size={34} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{itemPartner?.name ?? 'Traveler'}</div>
                  <div style={{ fontSize: 10.5, color: T.muted }}>{match.compatibilityScore}% match</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeMatch && partner ? (
          <>
            <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <Avatar user={partner} size={36} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{partner.name}</div>
                <div style={{ fontSize: 10.5, color: T.muted }}>{partner.homeCity ?? 'Unknown city'} · {activeMatch.compatibilityScore}% match</div>
              </div>
              <Button variant="outline" size="sm" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/profile/${partner._id}`)}>View profile</Button>
            </div>

            {error && <Notice>{error}</Notice>}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!messages.length && <div style={{ alignSelf: 'center', color: T.muted, fontSize: 12 }}>No messages yet. Start the conversation.</div>}
              {messages.map((item) => (
                <Bubble key={item._id} who={String(item.sender) === currentUserId ? 'me' : 'them'}>{item.body}</Bubble>
              ))}
            </div>

            <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.line}`, display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && void sendMessage()}
                placeholder={`Message ${partner.name.split(' ')[0]}`}
                style={{ flex: 1, height: 38, padding: '0 14px', borderRadius: 19, border: `1px solid ${T.line}`, fontSize: 12.5, color: T.ink, outline: 'none' }}
              />
              <button onClick={() => void sendMessage()} style={{ height: 38, padding: '0 14px', borderRadius: 8, background: T.ink, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600 }}>
                <IconSend size={13} /> Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: T.muted }}>No matched conversations yet.</div>
        )}
      </div>
    </div>
  )
}

function getPartner(match: MatchRecord, currentUserId: string) {
  return match.users.find((user) => user._id !== currentUserId) ?? match.users[0]
}

function Avatar({ user, size }: { user?: MatchUser; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: T.fill, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      {user?.photos?.[0] ? <img src={user.photos[0]} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 900 }}>{user?.name?.slice(0, 1).toUpperCase() ?? '?'}</span>}
    </div>
  )
}

function Notice({ children }: { children: string }) {
  return <div style={{ margin: 12, padding: 12, borderRadius: 8, background: '#fff0e9', border: '1px solid #efb49f', color: '#7a2c19', fontSize: 13, fontWeight: 700 }}>{children}</div>
}
