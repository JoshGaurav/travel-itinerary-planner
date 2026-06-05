import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'Suggest hidden gems in Tokyo',
  'Best street food in Bangkok',
  'Budget tips for Europe',
  'Generate a 3-day Paris itinerary',
]

export function AICompanion() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI travel companion ✈️ Ask me anything — suggest activities, plan a day, recommend restaurants, or generate a full itinerary for any destination!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setHasNew(false)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

  const send = async (text?: string) => {
    const userText = text || input.trim()
    if (!userText || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an expert AI travel companion built into a travel itinerary planning app called Itinera. 
You help users with:
- Suggesting activities, restaurants, and hidden gems for any destination
- Creating day-by-day itineraries
- Budget tips and travel advice
- Best times to visit places
- Local customs and culture tips

Keep responses concise, friendly, and practical. Use emojis sparingly. 
When generating itineraries, format them clearly with Day 1, Day 2 etc.
Always be enthusiastic about travel!`,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response. Please try again!"

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setHasNew(true)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops, something went wrong. Please check your connection and try again!",
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={s.window}>
          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.avatarWrap}>
                <span style={s.avatarEmoji}>✈</span>
                <span style={s.onlineDot} />
              </div>
              <div>
                <p style={s.headerTitle}>AI Travel Companion</p>
                <p style={s.headerSub}>Powered by Claude</p>
              </div>
            </div>
            <button style={s.closeBtn} onClick={() => setOpen(false)}>×</button>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === 'user' ? s.userMsgWrap : s.asMsgWrap}>
                {msg.role === 'assistant' && (
                  <div style={s.asMsgAvatar}>✈</div>
                )}
                <div style={msg.role === 'user' ? s.userMsg : s.asMsg}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={s.asMsgWrap}>
                <div style={s.asMsgAvatar}>✈</div>
                <div style={s.asMsg}>
                  <div style={s.typingDots}>
                    <span style={s.dot} />
                    <span style={{ ...s.dot, animationDelay: '0.2s' }} />
                    <span style={{ ...s.dot, animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={s.quickPrompts}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} style={s.quickBtn} onClick={() => send(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={s.inputRow}>
            <input
              style={s.input}
              placeholder="Ask about any destination..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button
              style={{ ...s.sendBtn, opacity: input.trim() && !loading ? 1 : 0.4 }}
              onClick={() => send()}
              disabled={!input.trim() || loading}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button style={s.fab} onClick={() => setOpen(o => !o)}>
        {open ? (
          <span style={s.fabIcon}>×</span>
        ) : (
          <>
            <span style={s.fabIcon}>✈</span>
            {hasNew && <span style={s.fabDot} />}
          </>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}

const s: Record<string, React.CSSProperties> = {
  window: {
    position: 'fixed', bottom: '90px', right: '24px',
    width: '360px', height: '520px',
    background: '#1a1714', border: '1px solid #3d3630',
    borderRadius: '24px', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', zIndex: 9999,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid #3d3630',
    background: '#231f1b', flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatarWrap: {
    position: 'relative', width: '38px', height: '38px',
    borderRadius: '50%', background: 'rgba(196,132,92,0.15)',
    border: '1px solid rgba(196,132,92,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: '16px' },
  onlineDot: {
    position: 'absolute', bottom: '1px', right: '1px',
    width: '9px', height: '9px', borderRadius: '50%',
    background: '#4CAF82', border: '2px solid #231f1b',
  },
  headerTitle: { fontSize: '14px', fontWeight: 600, color: '#f5efe6', margin: 0 },
  headerSub: { fontSize: '11px', color: '#8a7d72', margin: 0 },
  closeBtn: {
    background: 'transparent', border: 'none',
    color: '#8a7d72', fontSize: '22px', cursor: 'pointer', padding: '0 4px', lineHeight: 1,
  },

  messages: {
    flex: 1, overflowY: 'auto', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },

  asMsgWrap: { display: 'flex', alignItems: 'flex-start', gap: '8px' },
  asMsgAvatar: {
    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
    background: 'rgba(196,132,92,0.15)', border: '1px solid rgba(196,132,92,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
  },
  asMsg: {
    background: '#2a2520', border: '1px solid #3d3630',
    borderRadius: '4px 16px 16px 16px', padding: '10px 14px',
    fontSize: '13px', color: '#b8a99a', lineHeight: 1.6, maxWidth: '280px',
    whiteSpace: 'pre-wrap',
  },

  userMsgWrap: { display: 'flex', justifyContent: 'flex-end' },
  userMsg: {
    background: '#c4845c', borderRadius: '16px 4px 16px 16px',
    padding: '10px 14px', fontSize: '13px', color: '#fff',
    lineHeight: 1.6, maxWidth: '260px',
  },

  typingDots: { display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' },
  dot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#8a7d72',
    animation: 'bounce 1.2s infinite ease-in-out',
  },

  quickPrompts: {
    padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px', flexShrink: 0,
  },
  quickBtn: {
    background: 'rgba(196,132,92,0.08)', border: '1px solid rgba(196,132,92,0.2)',
    borderRadius: '100px', padding: '6px 12px', fontSize: '12px',
    color: '#c4845c', cursor: 'pointer', fontWeight: 500,
  },

  inputRow: {
    display: 'flex', gap: '8px', padding: '12px 16px',
    borderTop: '1px solid #3d3630', background: '#231f1b', flexShrink: 0,
  },
  input: {
    flex: 1, background: '#1a1714', border: '1px solid #3d3630',
    borderRadius: '12px', padding: '10px 14px', fontSize: '13px',
    color: '#f5efe6', outline: 'none',
  },
  sendBtn: {
    width: '38px', height: '38px', borderRadius: '12px',
    background: '#c4845c', border: 'none', color: '#fff',
    fontSize: '18px', cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  fab: {
    position: 'fixed', bottom: '24px', right: '24px',
    width: '56px', height: '56px', borderRadius: '50%',
    background: '#c4845c', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, boxShadow: '0 4px 20px rgba(196,132,92,0.4)',
  },
  fabIcon: { fontSize: '22px', color: '#fff' },
  fabDot: {
    position: 'absolute', top: '6px', right: '6px',
    width: '10px', height: '10px', borderRadius: '50%',
    background: '#4CAF82', border: '2px solid #c4845c',
  },
}
