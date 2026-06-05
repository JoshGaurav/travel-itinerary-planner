import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

const PERSONAS = [
  { id: 'budget', label: 'Budget', icon: '🎒', desc: 'Street food, hostels, smart choices' },
  { id: 'midrange', label: 'Mid-range', icon: '🏨', desc: 'Comfy stays, curated dining' },
  { id: 'luxurious', label: 'Luxurious', icon: '✨', desc: '5-star, private guides, the best' },
  { id: 'adventure', label: 'Adventure', icon: '🧗', desc: 'Hikes, water sports, wild stays' },
]

function getDatesInRange(start: Date, end: Date): Date[] {
  const dates = []
  const current = new Date(start)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]!
}

function CalendarPicker({
  startDate, endDate, onSelect
}: {
  startDate: Date | null
  endDate: Date | null
  onSelect: (date: Date) => void
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false
    const d = new Date(viewYear, viewMonth, day)
    return d > startDate && d < endDate
  }
  const isStart = (day: number) => startDate && formatDate(new Date(viewYear, viewMonth, day)) === formatDate(startDate)
  const isEnd = (day: number) => endDate && formatDate(new Date(viewYear, viewMonth, day)) === formatDate(endDate)
  const isPast = (day: number) => new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div style={cal.wrap}>
      <div style={cal.header}>
        <button onClick={prevMonth} style={cal.navBtn}>‹</button>
        <span style={cal.monthLabel}>{monthName} {viewYear}</span>
        <button onClick={nextMonth} style={cal.navBtn}>›</button>
      </div>
      <div style={cal.grid}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={cal.dayName}>{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const start = isStart(day)
          const end = isEnd(day)
          const inRange = isInRange(day)
          const past = isPast(day)
          return (
            <button
              key={day}
              onClick={() => !past && onSelect(new Date(viewYear, viewMonth, day))}
              style={{
                ...cal.day,
                ...(start || end ? cal.daySelected : {}),
                ...(inRange ? cal.dayInRange : {}),
                ...(past ? cal.dayPast : {}),
              }}
              disabled={past}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CreateTripPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [adults_male, setAdultsMale] = useState(1)
  const [adults_female, setAdultsFemale] = useState(1)
  const [kids, setKids] = useState(0)
  const [persona, setPersona] = useState<string | null>(null)
  const [mustHaves, setMustHaves] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDateSelect = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date)
      setEndDate(null)
    } else {
      if (date < startDate) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }
    }
  }

  const counter = (val: number, set: (v: number) => void, min = 0) => (
    <div style={s.counterRow}>
      <button style={s.counterBtn} onClick={() => set(Math.max(min, val - 1))}>−</button>
      <span style={s.counterVal}>{val}</span>
      <button style={s.counterBtn} onClick={() => set(val + 1)}>+</button>
    </div>
  )

  const handleSubmit = async () => {
    setError('')
    if (!destination.trim()) return setError('Destination is required')
    if (!startDate || !endDate) return setError('Please select a date range')
    if (!persona) return setError('Please select a travel persona')

    setLoading(true)

    const { data: trip, error: insertError } = await supabase
      .from('trips')
      .insert({
        user_id: user!.id,
        destination: destination.trim(),
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        notes: mustHaves.trim(),
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    const dates = getDatesInRange(startDate, endDate)
    await supabase.from('itinerary_days').insert(
      dates.map((d, i) => ({
        trip_id: trip.id,
        day_date: formatDate(d),
        day_number: i + 1,
        notes: '',
      }))
    )
    navigate(`/trips/${trip.id}`)
  }

  const nightCount = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
    : null

  return (
    <div style={s.page}>
      <div style={s.card}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Back to My Trips</button>
        <h1 style={s.heading}>Plan a New Trip</h1>
        <p style={s.sub}>Where are you headed? Fill in the details below.</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Destination */}
        <div style={s.section}>
          <label style={s.label}>Where to?</label>
          <input
            style={s.input}
            placeholder="e.g. Kyoto, Japan"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
        </div>

        {/* Date range */}
        <div style={s.section}>
          <label style={s.label}>When?</label>
          {startDate && (
            <p style={s.dateDisplay}>
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {endDate ? ` → ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${nightCount} nights` : ' → pick end date'}
            </p>
          )}
          <CalendarPicker startDate={startDate} endDate={endDate} onSelect={handleDateSelect} />
        </div>

        {/* Demographics */}
        <div style={s.section}>
          <label style={s.label}>Who's coming?</label>
          <div style={s.demoBox}>
            {[
              { label: 'Adults (Male)', val: adults_male, set: setAdultsMale },
              { label: 'Adults (Female)', val: adults_female, set: setAdultsFemale },
              { label: 'Kids', sub: 'under 18', val: kids, set: setKids },
            ].map(({ label, sub, val, set }) => (
              <div key={label} style={s.demoRow}>
                <div>
                  <div style={s.demoLabel}>{label}</div>
                  {sub && <div style={s.demoSub}>{sub}</div>}
                </div>
                {counter(val, set)}
              </div>
            ))}
          </div>
        </div>

        {/* Persona */}
        <div style={s.section}>
          <label style={s.label}>Travel persona</label>
          <p style={s.sub}>Defines your activity + accommodation tier</p>
          <div style={s.personaGrid}>
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                style={{
                  ...s.personaCard,
                  ...(persona === p.id ? s.personaActive : {}),
                }}
              >
                <div style={s.personaIcon}>{p.icon}</div>
                <div style={s.personaLabel}>{p.label}</div>
                <div style={s.personaDesc}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Must haves */}
        <div style={s.section}>
          <label style={s.label}>Must-haves <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
          <textarea
            style={s.textarea}
            placeholder="e.g. a rooftop dinner, a day at the beach, skip temples..."
            value={mustHaves}
            onChange={e => setMustHaves(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          loading={loading}
          style={{ width: '100%', marginTop: '8px' }}
        >
          Create Trip
        </Button>
      </div>
    </div>
  )
}

const cal: Record<string, React.CSSProperties> = {
  wrap: { background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px', marginTop: '10px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  navBtn: { background: 'transparent', border: 'none', color: 'var(--cream)', fontSize: '20px', cursor: 'pointer', padding: '0 8px' },
  monthLabel: { fontFamily: "'Playfair Display', serif", fontSize: '15px', color: 'var(--cream)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  dayName: { textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 0' },
  day: { textAlign: 'center', padding: '7px 0', fontSize: '13px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--cream)', cursor: 'pointer' },
  daySelected: { background: 'var(--accent)', color: '#fff', fontWeight: 600 },
  dayInRange: { background: 'rgba(210, 120, 80, 0.2)' },
  dayPast: { opacity: 0.3, cursor: 'not-allowed' },
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: '620px', margin: '0 auto', padding: '48px 24px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '44px' },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', marginBottom: '28px', padding: 0 },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700, marginBottom: '8px', color: 'var(--cream)' },
  sub: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' },
  section: { marginBottom: '32px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--cream)', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', fontSize: '15px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' },
  dateDisplay: { fontSize: '14px', color: 'var(--accent)', marginBottom: '8px', fontWeight: 500 },
  demoBox: { background: 'rgba(255,255,255,0.04)', borderRadius: '14px', overflow: 'hidden' },
  demoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' },
  demoLabel: { fontSize: '14px', color: 'var(--cream)', fontWeight: 500 },
  demoSub: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' },
  counterRow: { display: 'flex', alignItems: 'center', gap: '14px' },
  counterBtn: { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--cream)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counterVal: { fontSize: '16px', fontWeight: 600, color: 'var(--cream)', minWidth: '20px', textAlign: 'center' },
  personaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' },
  personaCard: { background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px', cursor: 'pointer', textAlign: 'left' },
  personaActive: { border: '1.5px solid var(--accent)', background: 'rgba(210,120,80,0.12)' },
  personaIcon: { fontSize: '22px', marginBottom: '8px' },
  personaLabel: { fontSize: '14px', fontWeight: 600, color: 'var(--cream)', marginBottom: '4px' },
  personaDesc: { fontSize: '12px', color: 'var(--text-secondary)' },
  error: { background: 'rgba(196,107,107,0.12)', color: 'var(--error)', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px' },
}