import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

const PERSONAS = [
  { id: 'budget', label: 'Budget', icon: '🎒', desc: 'Street food, hostels, smart choices', color: '#4CAF82', bg: 'rgba(76,175,130,0.1)', border: 'rgba(76,175,130,0.35)' },
  { id: 'midrange', label: 'Mid-range', icon: '🏨', desc: 'Comfy stays, curated dining', color: '#4A9FD4', bg: 'rgba(74,159,212,0.1)', border: 'rgba(74,159,212,0.35)' },
  { id: 'luxurious', label: 'Luxurious', icon: '✨', desc: '5-star, private guides, the best', color: '#D4A44A', bg: 'rgba(212,164,74,0.1)', border: 'rgba(212,164,74,0.35)' },
  { id: 'adventure', label: 'Adventure', icon: '🧗', desc: 'Hikes, water sports, wild stays', color: '#E07B4A', bg: 'rgba(224,123,74,0.1)', border: 'rgba(224,123,74,0.35)' },
]

const STEPS = ['Destination', 'Dates', 'Travellers', 'Persona', 'Details']

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
  const [step, setStep] = useState(0)
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
  const [loadingMsg, setLoadingMsg] = useState('Creating your trip...')

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

  const nightCount = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
    : null

  const totalTravellers = adults_male + adults_female + kids

  const canProceed = () => {
    if (step === 0) return destination.trim().length > 0
    if (step === 1) return startDate !== null && endDate !== null
    if (step === 2) return totalTravellers > 0
    if (step === 3) return persona !== null
    return true
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
    setLoadingMsg('Creating your trip...')

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
    const { data: insertedDays } = await supabase
      .from('itinerary_days')
      .insert(
        dates.map((d, i) => ({
          trip_id: trip.id,
          day_date: formatDate(d),
          day_number: i + 1,
          notes: '',
        }))
      )
      .select()

    setLoadingMsg('AI is crafting your itinerary... ✨')
    try {
      const { data: aiData } = await supabase.functions.invoke('generate-itinerary', {
        body: {
          destination: destination.trim(),
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          persona,
          must_haves: mustHaves.trim(),
          adults_male,
          adults_female,
          kids,
        },
      })

      if (aiData?.itinerary && insertedDays) {
        const dayMap = new Map(insertedDays.map((d: any, i: number) => [i + 1, d.id]))
        const activities = aiData.itinerary.days.flatMap((day: any) =>
          day.activities.map((act: any, idx: number) => ({
            day_id: dayMap.get(day.day_number),
            title: act.title,
            activity_type: act.type,
            start_time: act.start_time || null,
            location: act.location || '',
            description: act.description || '',
            latitude: act.latitude || null,
            longitude: act.longitude || null,
            sort_order: idx,
          }))
        ).filter((a: any) => a.day_id)

        await supabase.from('activities').insert(activities)
        await supabase.from('ai_suggestions').insert({
          trip_id: trip.id,
          prompt_text: `${destination} - ${persona} - ${mustHaves}`,
          response_json: aiData.itinerary,
          model_used: 'gpt-4o',
        })
      }
    } catch (e) {
      console.error('AI generation failed:', e)
    }

    navigate(`/trips/${trip.id}`)
  }

  const selectedPersona = PERSONAS.find(p => p.id === persona)

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Back button */}
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>
          ← Back to My Trips
        </button>

        {/* Header */}
        <div style={s.cardHeader}>
          <div style={s.headerLeft}>
            <div style={s.eyebrowPill}>
              <span style={s.eyebrowDot} />
              New Trip
            </div>
            <h1 style={s.heading}>Plan your adventure</h1>
            <p style={s.sub}>Fill in the details and let AI craft your perfect itinerary.</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={s.stepBar}>
          {STEPS.map((label, i) => (
            <div key={i} style={s.stepItem}>
              <div style={{
                ...s.stepDot,
                ...(i < step ? s.stepDone : {}),
                ...(i === step ? s.stepActive : {}),
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{
                ...s.stepLabel,
                color: i === step ? 'var(--cream)' : i < step ? 'var(--accent)' : 'var(--text-muted)',
              }}>{label}</span>
              {i < STEPS.length - 1 && (
                <div style={{ ...s.stepLine, background: i < step ? 'var(--accent)' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>

        {error && <div style={s.error}>{error}</div>}

        {/* ── STEP 0: DESTINATION ── */}
        {step === 0 && (
          <div style={s.stepContent}>
            <label style={s.label}>Where to?</label>
            <p style={s.fieldHint}>City, country, or region</p>
            <input
              style={s.input}
              placeholder="e.g. Kyoto, Japan"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && canProceed() && setStep(1)}
            />
            {destination && (
              <div style={s.destinationPreview}>
                <span style={s.destinationPreviewIcon}>📍</span>
                <span style={s.destinationPreviewText}>{destination}</span>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: DATES ── */}
        {step === 1 && (
          <div style={s.stepContent}>
            <label style={s.label}>When are you going?</label>
            <p style={s.fieldHint}>Click a start date, then an end date</p>
            {startDate && (
              <div style={s.dateSummary}>
                <div style={s.dateSummaryItem}>
                  <span style={s.dateSummaryLabel}>Check-in</span>
                  <span style={s.dateSummaryValue}>
                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {endDate && (
                  <>
                    <div style={s.dateSummaryArrow}>→</div>
                    <div style={s.dateSummaryItem}>
                      <span style={s.dateSummaryLabel}>Check-out</span>
                      <span style={s.dateSummaryValue}>
                        {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={s.nightsBadge}>{nightCount} nights</div>
                  </>
                )}
                {!endDate && <span style={s.dateSummaryHint}>→ pick end date</span>}
              </div>
            )}
            <CalendarPicker startDate={startDate} endDate={endDate} onSelect={handleDateSelect} />
          </div>
        )}

        {/* ── STEP 2: TRAVELLERS ── */}
        {step === 2 && (
          <div style={s.stepContent}>
            <label style={s.label}>Who's coming?</label>
            <p style={s.fieldHint}>This helps AI tailor activities and accommodation</p>
            <div style={s.demoBox}>
              {[
                { label: 'Adults (Male)', sub: '', val: adults_male, set: setAdultsMale },
                { label: 'Adults (Female)', sub: '', val: adults_female, set: setAdultsFemale },
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
            <div style={s.travellerSummary}>
              <span style={s.travellerIcon}>👥</span>
              <span style={s.travellerText}>{totalTravellers} traveller{totalTravellers !== 1 ? 's' : ''} total</span>
            </div>
          </div>
        )}

        {/* ── STEP 3: PERSONA ── */}
        {step === 3 && (
          <div style={s.stepContent}>
            <label style={s.label}>Travel persona</label>
            <p style={s.fieldHint}>Sets your activity and accommodation style</p>
            <div style={s.personaGrid}>
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  style={{
                    ...s.personaCard,
                    ...(persona === p.id ? {
                      border: `1.5px solid ${p.border}`,
                      background: p.bg,
                    } : {}),
                  }}
                >
                  <div style={s.personaIcon}>{p.icon}</div>
                  <div style={{
                    ...s.personaLabel,
                    color: persona === p.id ? p.color : 'var(--cream)',
                  }}>{p.label}</div>
                  <div style={s.personaDesc}>{p.desc}</div>
                  {persona === p.id && (
                    <div style={{ ...s.personaCheck, background: p.color }}>✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4: MUST-HAVES ── */}
        {step === 4 && (
          <div style={s.stepContent}>
            <label style={s.label}>
              Must-haves <span style={{ fontWeight: 400, opacity: 0.5, fontSize: '13px' }}>(optional)</span>
            </label>
            <p style={s.fieldHint}>Tell the AI what you absolutely want or don't want</p>
            <textarea
              style={s.textarea}
              placeholder="e.g. a rooftop dinner, a day at the beach, skip temples, vegetarian food only..."
              value={mustHaves}
              onChange={e => setMustHaves(e.target.value)}
              rows={4}
              autoFocus
            />

            {/* Trip summary before generating */}
            <div style={s.summary}>
              <p style={s.summaryTitle}>Your trip summary</p>
              <div style={s.summaryGrid}>
                <div style={s.summaryItem}>
                  <span style={s.summaryItemIcon}>📍</span>
                  <span style={s.summaryItemText}>{destination}</span>
                </div>
                {startDate && endDate && (
                  <div style={s.summaryItem}>
                    <span style={s.summaryItemIcon}>📅</span>
                    <span style={s.summaryItemText}>
                      {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {nightCount} nights
                    </span>
                  </div>
                )}
                <div style={s.summaryItem}>
                  <span style={s.summaryItemIcon}>👥</span>
                  <span style={s.summaryItemText}>{totalTravellers} traveller{totalTravellers !== 1 ? 's' : ''}</span>
                </div>
                {selectedPersona && (
                  <div style={s.summaryItem}>
                    <span style={s.summaryItemIcon}>{selectedPersona.icon}</span>
                    <span style={s.summaryItemText}>{selectedPersona.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={s.navRow}>
          {step > 0 && (
            <button style={s.prevBtn} onClick={() => { setError(''); setStep(s => s - 1) }}>
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => { setError(''); setStep(s => s + 1) }}
              style={{ opacity: canProceed() ? 1 : 0.4, pointerEvents: canProceed() ? 'auto' : 'none' }}
            >
              Continue →
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              {loading ? loadingMsg : '✨ Generate AI Itinerary'}
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

const cal: Record<string, React.CSSProperties> = {
  wrap: { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', marginTop: '12px', border: '1px solid var(--border)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  navBtn: { background: 'transparent', border: 'none', color: 'var(--cream)', fontSize: '20px', cursor: 'pointer', padding: '0 8px' },
  monthLabel: { fontFamily: "'Playfair Display', serif", fontSize: '15px', color: 'var(--cream)', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  dayName: { textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 0', fontWeight: 600 },
  day: { textAlign: 'center', padding: '8px 0', fontSize: '13px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--cream)', cursor: 'pointer', transition: 'background 0.15s' },
  daySelected: { background: 'var(--accent)', color: '#fff', fontWeight: 700 },
  dayInRange: { background: 'rgba(196,132,92,0.2)' },
  dayPast: { opacity: 0.25, cursor: 'not-allowed' },
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: '640px', margin: '0 auto', padding: '48px 24px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '44px' },

  backBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', marginBottom: '28px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' },

  cardHeader: { marginBottom: '32px' },
  headerLeft: {},
  eyebrowPill: { display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(196,132,92,0.1)', border: '1px solid rgba(196,132,92,0.25)', borderRadius: '100px', padding: '5px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' },
  eyebrowDot: { width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700, marginBottom: '6px', color: 'var(--cream)', letterSpacing: '-0.3px' },
  sub: { color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 },

  // Step bar
  stepBar: { display: 'flex', alignItems: 'center', marginBottom: '36px', gap: '0' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '6px', flex: 1 },
  stepDot: { width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0 },
  stepActive: { background: 'var(--accent)', border: '1.5px solid var(--accent)', color: '#fff' },
  stepDone: { background: 'rgba(196,132,92,0.15)', border: '1.5px solid var(--accent)', color: 'var(--accent)' },
  stepLabel: { fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' },
  stepLine: { flex: 1, height: '1.5px', marginLeft: '6px' },

  stepContent: { marginBottom: '32px', minHeight: '200px' },
  label: { display: 'block', fontSize: '15px', fontWeight: 700, color: 'var(--cream)', marginBottom: '4px' },
  fieldHint: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' },

  input: { width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', fontSize: '16px', boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 },

  destinationPreview: { display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', background: 'rgba(196,132,92,0.1)', border: '1px solid rgba(196,132,92,0.25)', borderRadius: '100px', padding: '6px 14px' },
  destinationPreviewIcon: { fontSize: '14px' },
  destinationPreviewText: { fontSize: '14px', color: 'var(--accent)', fontWeight: 600 },

  dateSummary: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '14px 18px', border: '1px solid var(--border)' },
  dateSummaryItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  dateSummaryLabel: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  dateSummaryValue: { fontSize: '14px', color: 'var(--cream)', fontWeight: 600 },
  dateSummaryArrow: { color: 'var(--text-muted)', fontSize: '16px' },
  dateSummaryHint: { fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' },
  nightsBadge: { marginLeft: 'auto', background: 'rgba(196,132,92,0.12)', border: '1px solid rgba(196,132,92,0.25)', borderRadius: '100px', padding: '4px 12px', fontSize: '12px', color: 'var(--accent)', fontWeight: 700 },

  demoBox: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' },
  demoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' },
  demoLabel: { fontSize: '14px', color: 'var(--cream)', fontWeight: 500 },
  demoSub: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' },
  counterRow: { display: 'flex', alignItems: 'center', gap: '16px' },
  counterBtn: { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--cream)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counterVal: { fontSize: '16px', fontWeight: 700, color: 'var(--cream)', minWidth: '20px', textAlign: 'center' },
  travellerSummary: { display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '100px', padding: '6px 14px', border: '1px solid var(--border)' },
  travellerIcon: { fontSize: '14px' },
  travellerText: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 },

  personaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' },
  personaCard: { position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '18px 16px', cursor: 'pointer', textAlign: 'left', transition: 'border 0.15s, background 0.15s' },
  personaIcon: { fontSize: '24px', marginBottom: '10px' },
  personaLabel: { fontSize: '14px', fontWeight: 700, marginBottom: '4px' },
  personaDesc: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 },
  personaCheck: { position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', borderRadius: '50%', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  summary: { marginTop: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' },
  summaryTitle: { fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' },
  summaryGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  summaryItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  summaryItemIcon: { fontSize: '15px', flexShrink: 0 },
  summaryItemText: { fontSize: '14px', color: 'var(--text-secondary)' },

  navRow: { display: 'flex', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: '8px' },
  prevBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '12px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer' },

  error: { background: 'rgba(196,107,107,0.1)', color: 'var(--error)', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(196,107,107,0.2)' },
}
