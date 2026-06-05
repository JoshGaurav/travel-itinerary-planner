import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import knowledgeBase from '../assets/gemini-code-1780667290332.json'

interface City {
  id: string
  city: string
  aliases: string[]
  country: string
  country_code: string
  region: string
  airports: Airport[]
  popular_spots: Spot[]
}

interface Airport {
  iata: string
  name: string
  type: string
  distance_km: number
  intl_visitor_use: boolean
  priority: number
}

interface Spot {
  name: string
  alt_name: string | null
  category: string
  tier: string
  must_see: boolean
  priority: number
}

interface Message {
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

const cities: City[] = (knowledgeBase as { cities: City[] }).cities

function normalise(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '')
}

function findCity(query: string): City | null {
  const q = normalise(query)
  return (
    cities.find(c =>
      c.aliases.some(a => normalise(a) === q) || normalise(c.city) === q
    ) ||
    cities.find(c =>
      c.aliases.some(a => normalise(a).includes(q) || q.includes(normalise(a))) ||
      normalise(c.city).includes(q) ||
      q.includes(normalise(c.city))
    ) ||
    null
  )
}

function findTwoCities(query: string): { from: City | null; to: City | null } {
  const from = cities.find(c =>
    c.aliases.some(a => query.toLowerCase().includes(normalise(a))) ||
    query.toLowerCase().includes(normalise(c.city))
  )
  const remaining = from
    ? from.aliases.reduce(
        (s, a) => s.replace(normalise(a), ''),
        query.toLowerCase().replace(normalise(from.city), '')
      )
    : query

  const to = cities
    .filter(c => c.id !== from?.id)
    .find(c =>
      c.aliases.some(a => remaining.includes(normalise(a))) ||
      remaining.includes(normalise(c.city))
    )

  return { from: from || null, to: to || null }
}

function extractDays(query: string): number {
  const match = query.match(/(\d+)\s*(?:day|days|night|nights)/i)
  return match ? parseInt(match[1]!) : 3
}

function buildItinerary(city: City, days: number, style?: string): string {
  const mustSee = city.popular_spots.filter(s => s.must_see).sort((a, b) => a.priority - b.priority)
  const recommended = city.popular_spots.filter(s => !s.must_see).sort((a, b) => a.priority - b.priority)
  const all = [...mustSee, ...recommended]

  const timeSlots = ['Morning', 'Late Morning', 'Afternoon', 'Evening']
  const lines: string[] = []

  const spotsPerDay = Math.min(4, Math.ceil(all.length / days))

  for (let d = 1; d <= days; d++) {
    lines.push(`**Day ${d}**`)
    const daySpots = all.slice((d - 1) * spotsPerDay, d * spotsPerDay)

    if (daySpots.length === 0) {
      lines.push('• Free day — explore local neighbourhoods and cuisine at your own pace.\n')
      continue
    }

    daySpots.forEach((spot, i) => {
      const slot = timeSlots[i % timeSlots.length]!
      const badge = spot.must_see ? ' ★' : ''
      lines.push(`• **${slot}** — ${spot.name}${badge}`)
      if (spot.category === 'Day Trip') {
        lines.push(`  *(Full day excursion — plan this as the main activity for the day)*`)
      }
    })

    lines.push('')
  }

  const tip = style === 'budget'
    ? '\n**Budget tip:** Use public transport, eat at local markets, and look for free museum days.'
    : style === 'luxurious'
    ? '\n**Luxury tip:** Book priority access tickets in advance and consider private guided tours.'
    : ''

  return lines.join('\n') + tip
}

function detectIntent(query: string): string {
  const q = query.toLowerCase()
  if (/fly|flight|airport|from .+ to|travel from|going from/i.test(q)) return 'flight'
  if (/recommend|suggest|where|options|ideas|help me choose|can't decide|which city/i.test(q)) return 'discover'
  if (/\d+\s*day|\d+\s*night|itinerary|plan|schedule|what to do|things to do|visit/i.test(q)) return 'itinerary'
  if (/hello|hi |hey |help|what can you/i.test(q)) return 'greeting'
  return 'itinerary'
}

function handleGreeting(): string {
  return `Hello! I'm your Itinera travel assistant.

Here's what I can help you with:

**1. City Itinerary** — Tell me a city and how many days, and I'll build a day-by-day plan.
*Example: "Plan 4 days in Tokyo"*

**2. Trip with Flights** — Give me your origin and destination and I'll suggest airports and a full trip plan.
*Example: "I'm flying from London to Barcelona"*

**3. City Discovery** — Not sure where to go? Tell me your vibe (beach, culture, adventure, budget…) and I'll suggest 2–3 destinations.
*Example: "Suggest a 5-day cultural trip in Europe"*

I work from a curated database of 50 top global cities. Where shall we start?`
}

function handleFlight(query: string): string {
  const { from, to } = findTwoCities(query)

  if (!from && !to) {
    return "I couldn't identify the cities in your query. Please try again with city names clearly stated — for example: *\"I'm flying from Mumbai to Singapore\"*."
  }

  if (!from || !to) {
    const found = from || to
    return `I found **${found!.city}** but couldn't identify the ${from ? 'destination' : 'origin'} city. Could you clarify? I cover 50 top global cities.`
  }

  const fromAirports = from.airports.filter(a => a.intl_visitor_use).slice(0, 2)
  const toAirports = to.airports.filter(a => a.intl_visitor_use).slice(0, 2)
  const days = extractDays(query) || 4

  const lines = [
    `## ${from.city} → ${to.city}`,
    '',
    `**Departing from ${from.city}:**`,
    ...fromAirports.map(a => `• ${a.name} (${a.iata}) — ${a.distance_km} km from city centre`),
    '',
    `**Arriving into ${to.city}:**`,
    ...toAirports.map(a => `• ${a.name} (${a.iata}) — ${a.distance_km} km from city centre`),
    '',
    `**Recommended duration:** ${days} days`,
    '',
    `### ${days}-Day Itinerary for ${to.city}`,
    '',
    buildItinerary(to, days),
    '',
    `**Practical tip:** ★ marks must-see highlights. Day trips listed are full-day excursions — factor those into your pacing.`,
  ]

  return lines.join('\n')
}

function handleItinerary(query: string): string {
  const days = extractDays(query)
  const city = findCity(query)

  if (!city) {
    return `I couldn't find that city in my database. I cover 50 top global destinations including Paris, Tokyo, Dubai, New York, Sydney, Cape Town, and more.\n\nCould you try a different city name, or would you like me to suggest some options?`
  }

  const lines = [
    `## ${days}-Day Itinerary: ${city.city}, ${city.country}`,
    '',
    buildItinerary(city, days),
    '',
    `**Getting there:** Fly into ${city.airports.filter(a => a.intl_visitor_use)[0]?.name ?? city.airports[0]?.name} (${city.airports.filter(a => a.intl_visitor_use)[0]?.iata ?? city.airports[0]?.iata}).`,
    '',
    `*★ = Must-see · Need a longer or shorter version? Just ask!*`,
  ]

  return lines.join('\n')
}

function handleDiscover(query: string): string {
  const q = query.toLowerCase()
  let candidates: City[] = []
  let themeLine = ''

  if (/beach|sun|tropical|island|coast/i.test(q)) {
    candidates = cities.filter(c => c.popular_spots.some(s => s.category === 'Beach')).slice(0, 3)
    themeLine = 'For a **beach & sun** escape, here are my top picks:'
  } else if (/history|culture|heritage|museum|ancient/i.test(q)) {
    candidates = cities.filter(c => c.popular_spots.some(s => s.category === 'Historic Site' && s.must_see)).slice(0, 3)
    themeLine = 'For a **history & culture** trip, these cities are outstanding:'
  } else if (/adventure|hiking|trek|outdoor/i.test(q)) {
    candidates = [
      cities.find(c => c.id === 'cape-town-za')!,
      cities.find(c => c.id === 'bali-id')!,
      cities.find(c => c.id === 'auckland-nz')!,
    ].filter(Boolean)
    themeLine = 'For an **adventure & outdoors** trip, consider these:'
  } else if (/budget|cheap|affordable|backpack/i.test(q)) {
    candidates = [
      cities.find(c => c.id === 'bangkok-th')!,
      cities.find(c => c.id === 'prague-cz')!,
      cities.find(c => c.id === 'marrakech-ma')!,
    ].filter(Boolean)
    themeLine = 'For a **budget-friendly** trip, these cities offer exceptional value:'
  } else if (/europe/i.test(q)) {
    candidates = [
      cities.find(c => c.id === 'barcelona-es')!,
      cities.find(c => c.id === 'prague-cz')!,
      cities.find(c => c.id === 'amsterdam-nl')!,
    ].filter(Boolean)
    themeLine = 'Top **European** destinations right now:'
  } else if (/asia/i.test(q)) {
    candidates = [
      cities.find(c => c.id === 'tokyo-jp')!,
      cities.find(c => c.id === 'singapore-sg')!,
      cities.find(c => c.id === 'bali-id')!,
    ].filter(Boolean)
    themeLine = 'Top **Asian** destinations:'
  } else {
    const shuffled = [...cities].sort(() => Math.random() - 0.5).slice(0, 3)
    candidates = shuffled
    themeLine = 'Here are 3 diverse destinations worth considering:'
  }

  const days = extractDays(query) || 4
  const lines = [themeLine, '']

  candidates.forEach(c => {
    const mustSee = c.popular_spots.filter(s => s.must_see).slice(0, 3).map(s => s.name).join(', ')
    const airport = c.airports.find(a => a.intl_visitor_use)
    lines.push(`### ${c.city}, ${c.country}`)
    lines.push(`Fly in via **${airport?.name ?? 'local airport'} (${airport?.iata ?? '?'})** · Ideal: ${days} days`)
    lines.push(`Highlights: ${mustSee}`)
    lines.push('')
  })

  lines.push(`*Want a full day-by-day plan for any of these? Just ask — e.g. "Plan ${days} days in ${candidates[0]?.city}"*`)

  return lines.join('\n')
}

function processQuery(query: string): string {
  const intent = detectIntent(query)
  switch (intent) {
    case 'greeting': return handleGreeting()
    case 'flight': return handleFlight(query)
    case 'discover': return handleDiscover(query)
    default: return handleItinerary(query)
  }
}

function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n')
  const elements: ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} style={md.h2}>{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} style={md.h3}>{line.slice(4)}</h3>)
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={key++} style={md.bold}>{line.slice(2, -2)}</p>)
    } else if (line.startsWith('• ')) {
      elements.push(
        <div key={key++} style={md.bullet}>
          <span style={md.dot}>•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      )
    } else if (line.startsWith('  *(') || line.startsWith('*(')) {
      elements.push(<p key={key++} style={md.italic}>{line.replace(/\*/g, '').trim()}</p>)
    } else if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: '8px' }} />)
    } else {
      elements.push(<p key={key++} style={md.p}>{formatInline(line)}</p>)
    }
  }

  return <>{elements}</>
}

function formatInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--cream)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} style={{ color: 'var(--text-muted)' }}>{part.slice(1, -1)}</em>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

const SUGGESTIONS = [
  'Plan 3 days in Tokyo',
  'I\'m flying from London to Barcelona',
  'Suggest a beach destination in Asia',
  'Plan 5 days in Rome',
  'Budget trip ideas in Europe',
  'Flying from New York to Dubai',
]

export function TravelAssistantPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: handleGreeting(),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || thinking) return

    const userMsg: Message = { role: 'user', text: trimmed, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setThinking(true)

    setTimeout(() => {
      const response = processQuery(trimmed)
      setMessages(prev => [...prev, { role: 'assistant', text: response, timestamp: new Date() }])
      setThinking(false)
    }, 600)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← My Trips</button>
        <div style={s.sidebarInner}>
          <p style={s.sidebarTitle}>Quick prompts</p>
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              style={s.sugBtn}
              onClick={() => {
                setInput(sug)
                inputRef.current?.focus()
              }}
            >
              {sug}
            </button>
          ))}

          <div style={s.divider} />
          <p style={s.sidebarTitle}>Knowledge base</p>
          <p style={s.kbNote}>{cities.length} cities across {new Set(cities.map(c => c.country_code)).size} countries</p>
          <div style={s.regionList}>
            {[
              { label: 'Europe', ids: ['paris-fr','london-gb','rome-it','barcelona-es','amsterdam-nl','berlin-de','prague-cz','vienna-at','madrid-es','lisbon-pt','athens-gr','budapest-hu','florence-it','venice-it','dublin-ie'] },
              { label: 'Asia', ids: ['tokyo-jp','kyoto-jp','singapore-sg','bangkok-th','phuket-th','kuala-lumpur-my','seoul-kr','hong-kong-hk','taipei-tw','bali-id','shanghai-cn'] },
              { label: 'Middle East', ids: ['dubai-ae','istanbul-tr','abu-dhabi-ae','doha-qa'] },
              { label: 'Americas', ids: ['new-york-us','los-angeles-us','san-francisco-us','miami-us','las-vegas-us','orlando-us','cancun-mx','mexico-city-mx','rio-de-janeiro-br','buenos-aires-ar','toronto-ca'] },
              { label: 'Africa', ids: ['cape-town-za','marrakech-ma','cairo-eg','johannesburg-za'] },
              { label: 'Oceania', ids: ['sydney-au','melbourne-au','auckland-nz'] },
              { label: 'South Asia', ids: ['new-delhi-in','mumbai-in'] },
            ].map(r => (
              <div key={r.label} style={s.regionRow}>
                <span style={s.regionLabel}>{r.label}</span>
                <span style={s.regionCount}>{r.ids.length}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <div style={s.chat}>
        <div style={s.chatHeader}>
          <div>
            <h1 style={s.chatTitle}>Travel Assistant</h1>
            <p style={s.chatSub}>Powered by Itinera's curated city knowledge base</p>
          </div>
          <div style={s.statusDot} title="Online" />
        </div>

        <div style={s.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...s.msgRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={s.avatar}>AI</div>
              )}
              <div
                style={{
                  ...s.bubble,
                  ...(msg.role === 'user' ? s.bubbleUser : s.bubbleAssistant),
                }}
              >
                {msg.role === 'assistant'
                  ? renderMarkdown(msg.text)
                  : <p style={{ margin: 0 }}>{msg.text}</p>
                }
                <p style={s.timestamp}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {thinking && (
            <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
              <div style={s.avatar}>AI</div>
              <div style={{ ...s.bubble, ...s.bubbleAssistant, ...s.typing }}>
                <span style={s.dot} />
                <span style={{ ...s.dot, animationDelay: '0.2s' }} />
                <span style={{ ...s.dot, animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={s.inputArea}>
          <input
            ref={inputRef}
            style={s.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to plan a trip, suggest destinations, or find airports…"
            disabled={thinking}
          />
          <button
            style={{ ...s.sendBtn, ...((!input.trim() || thinking) ? s.sendBtnDisabled : {}) }}
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

const md: Record<string, React.CSSProperties> = {
  h2: { fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: 'var(--cream)', margin: '12px 0 6px' },
  h3: { fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 600, color: 'var(--accent)', margin: '10px 0 4px' },
  bold: { fontWeight: 600, color: 'var(--cream)', margin: '4px 0 2px', fontSize: '13px' },
  p: { margin: '2px 0', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' },
  bullet: { display: 'flex', gap: '8px', margin: '3px 0', fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', alignItems: 'flex-start' },
  dot: { color: 'var(--accent)', flexShrink: 0, marginTop: '2px' },
  italic: { fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 2px 18px' },
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', height: 'calc(100vh - 68px)', overflow: 'hidden', background: 'var(--bg-primary)' },

  sidebar: {
    width: '260px',
    flexShrink: 0,
    borderRight: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  sidebarInner: { padding: '20px 16px', flex: 1 },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--border)', width: '100%' },
  sidebarTitle: { fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
  sugBtn: { display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '12px', padding: '9px 12px', cursor: 'pointer', marginBottom: '7px', lineHeight: 1.4, transition: 'all 0.2s' },
  divider: { height: '1px', background: 'var(--border)', margin: '20px 0' },
  kbNote: { fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' },
  regionList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  regionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  regionLabel: { fontSize: '12px', color: 'var(--text-secondary)' },
  regionCount: { fontSize: '11px', color: 'var(--accent)', fontWeight: 600 },

  chat: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--border)', background: 'rgba(26,23,20,0.9)', backdropFilter: 'blur(8px)' },
  chatTitle: { fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: 'var(--cream)', margin: 0 },
  chatSub: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  statusDot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' },

  messages: { flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' },

  msgRow: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--coral))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0 },

  bubble: { maxWidth: '72%', borderRadius: '16px', padding: '14px 18px', position: 'relative' },
  bubbleAssistant: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderTopLeftRadius: '4px' },
  bubbleUser: { background: 'linear-gradient(135deg, var(--accent), var(--coral))', color: 'white', borderTopRightRadius: '4px' },

  timestamp: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 },

  typing: { display: 'flex', gap: '5px', alignItems: 'center', padding: '16px 20px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'blink 1.4s infinite ease-in-out' },

  inputArea: { padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', background: 'var(--bg-secondary)' },
  input: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '14px 18px',
    color: 'var(--cream)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '14px 28px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  sendBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
}
