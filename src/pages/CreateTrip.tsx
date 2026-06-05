import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { type City, type Airport, searchCities, getDefaultSuggestions, getSortedAirports, getAllSpotsSorted } from '../data/cities'

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

// ── City search dropdown ──────────────────────────────────────────────────────
function CitySearchField({ onCitySelect }: { onCitySelect: (city: City | null) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<City[]>(getDefaultSuggestions())
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSuggestions(searchCities(query))
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (city: City) => {
    setSelectedCity(city)
    setQuery(`${city.city}, ${city.country}`)
    setOpen(false)
    onCitySelect(city)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (selectedCity) {
      setSelectedCity(null)
      onCitySelect(null)
    }
    setOpen(true)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        style={s.input}
        placeholder="e.g. Paris, France"
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div style={s.dropdown}>
          {suggestions.length === 0 ? (
            <div style={s.dropdownEmpty}>City not in our list — you can still continue</div>
          ) : (
            suggestions.map(city => (
              <button
                key={city.id}
                style={s.dropdownItem}
                onMouseDown={() => handleSelect(city)}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={s.dropdownCity}>{city.city}</span>
                <span style={s.dropdownCountry}>· {city.country}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Airport dropdown field ────────────────────────────────────────────────────
function AirportField({
  label,
  airports,
  disabled,
  value,
  onChange,
}: {
  label: string
  airports: Airport[]
  disabled: boolean
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [manual, setManual] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reset manual mode when airports change (new city selected)
  useEffect(() => {
    setManual(false)
    onChange('')
  }, [airports])

  const displayValue = value || ''

  if (manual) {
    return (
      <div style={s.airportGroup}>
        <label style={s.airportLabel}>{label}</label>
        <input
          style={s.input}
          placeholder="Enter IATA code or airport name"
          value={displayValue}
          onChange={e => onChange(e.target.value)}
          autoFocus
        />
      </div>
    )
  }

  return (
    <div ref={ref} style={{ ...s.airportGroup, position: 'relative' }}>
      <label style={s.airportLabel}>{label}</label>
      <button
        style={{
          ...s.input,
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.45 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        type="button"
      >
        <span style={{ color: displayValue ? 'var(--cream)' : 'rgba(255,255,255,0.35)', fontSize: '15px' }}>
          {displayValue || 'Select city first'}
        </span>
        <span style={{ fontSize: '12px', opacity: 0.5 }}>▾</span>
      </button>
      {open && (
        <div style={s.dropdown}>
          {airports.map(ap => (
            <button
              key={ap.iata}
              style={s.dropdownItem}
              onMouseDown={() => { onChange(`${ap.iata} · ${ap.name}`); setOpen(false) }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={s.dropdownCity}>{ap.iata}</span>
              <span style={s.dropdownCountry}>· {ap.name}</span>
            </button>
          ))}
          <button
            style={{ ...s.dropdownItem, borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '10px' }}
            onMouseDown={() => { setManual(true); setOpen(false) }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            ✏️ Enter airport manually
          </button>
        </div>
      )}
    </div>
  )
}

// ── Must-do multi-select ──────────────────────────────────────────────────────
function MustDoField({
  spots,
  disabled,
  selected,
  onChange,
}: {
  spots: string[]
  disabled: boolean
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (spot: string) => {
    onChange(selected.includes(spot) ? selected.filter(s => s !== spot) : [...selected, spot])
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        style={{
          ...s.input,
          minHeight: '48px',
          height: 'auto',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.45 : 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          paddingTop: selected.length ? '8px' : '12px',
          paddingBottom: selected.length ? '8px' : '12px',
        }}
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        {selected.length === 0 ? (
          <span style={{ color: disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.35)', fontSize: '15px' }}>
            {disabled ? 'Select a city to see options' : 'Select must-do experiences...'}
          </span>
        ) : (
          selected.map(spot => (
            <span key={spot} style={s.chip}>
              {spot}
              <span
                style={s.chipRemove}
                onMouseDown={e => { e.stopPropagation(); toggle(spot) }}
              >×</span>
            </span>
          ))
        )}
      </button>
      {open && (
        <div style={s.dropdown}>
          {spots.map(spot => {
            const checked = selected.includes(spot)
            return (
              <button
                key={spot}
                style={{ ...s.dropdownItem, fontWeight: checked ? 600 : 400 }}
                onMouseDown={() => toggle(spot)}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ marginRight: '8px', opacity: checked ? 1 : 0.3 }}>✓</span>
                {spot}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
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

// ── Main page ─────────────────────────────────────────────────────────────────
export function CreateTripPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [destination, setDestination] = useState('')
  const [arrivalAirport, setArrivalAirport] = useState('')
  const [departureAirport, setDepartureAirport] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [adults_male, setAdultsMale] = useState(0)
  const [adults_female, setAdultsFemale] = useState(0)
  const [kids, setKids] = useState(0)

  const [persona, setPersona] = useState<string | null>(null)
  const [mustDo, setMustDo] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('Creating your trip...')

  const totalTravellers = adults_male + adults_female + kids
  const canGenerate = totalTravellers >= 1

  const handleCitySelect = (city: City | null) => {
    setSelectedCity(city)
    setDestination(city ? `${city.city}, ${city.country}` : '')
    setMustDo([])
    setArrivalAirport('')
    setDepartureAirport('')
  }

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
    if (!canGenerate) return setError('Add at least 1 traveller to continue')

    setLoading(true)
    setLoadingMsg('Creating your trip...')

    const notes = [
      mustDo.length ? `Must-do: ${mustDo.join(', ')}` : '',
      arrivalAirport ? `Arriving via: ${arrivalAirport}` : '',
      departureAirport ? `Departing via: ${departureAirport}` : '',
    ].filter(Boolean).join('\n')

    const { data: trip, error: insertError } = await supabase
      .from('trips')
      .insert({
        user_id: user!.id,
        destination: destination.trim(),
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        notes,
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
          persona: persona || 'midrange',
          must_haves: mustDo.join(', '),
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
          prompt_text: `${destination} - ${persona} - ${mustDo.join(', ')}`,
          response_json: aiData.itinerary,
          model_used: 'gpt-4o',
        })
      }
    } catch (e) {
      console.error('AI generation failed:', e)
    }

    navigate(`/trips/${trip.id}`)
  }

  const nightCount = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
    : null

  const airports = selectedCity ? getSortedAirports(selectedCity) : []
  const spots = selectedCity ? getAllSpotsSorted(selectedCity).map(p => p.name) : []

  return (
    <div style={s.page}>
      <div style={s.card}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Back to My Trips</button>
        <h1 style={s.heading}>Plan a New Trip</h1>
        <p style={s.sub}>Where are you headed? Fill in the details below.</p>

        {error && <div style={s.error}>{error}</div>}

        {/* WHERE TO */}
        <div style={s.section}>
          <label style={s.label}>Where to?</label>
          <CitySearchField onCitySelect={handleCitySelect} />
        </div>

        {/* AIRPORTS */}
        <div style={{ ...s.section, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <AirportField
            label="Arrival Airport"
            airports={airports}
            disabled={!selectedCity}
            value={arrivalAirport}
            onChange={setArrivalAirport}
          />
          <AirportField
            label="Departure Airport"
            airports={airports}
            disabled={!selectedCity}
            value={departureAirport}
            onChange={setDepartureAirport}
          />
        </div>

        {/* WHEN */}
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

        {/* WHO'S COMING */}
        <div style={s.section}>
          <label style={s.label}>Who's coming?</label>
          {!canGenerate && (
            <p style={s.helperText}>Add at least 1 traveller to continue</p>
          )}
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
        </div>

        {/* TRAVEL PERSONA — optional, compact */}
        <div style={s.section}>
          <label style={s.label}>
            Travel persona <span style={{ fontWeight: 400, opacity: 0.55, fontSize: '13px' }}>(optional)</span>
          </label>
          <div style={s.personaGrid}>
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setPersona(persona === p.id ? null : p.id)}
                style={{
                  ...s.personaRow,
                  ...(persona === p.id ? s.personaActive : {}),
                }}
              >
                <span style={s.personaIcon}>{p.icon}</span>
                <div style={s.personaTextWrap}>
                  <span style={s.personaLabel}>{p.label}</span>
                  <span style={s.personaDesc}>{p.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* MUST-DO */}
        <div style={s.section}>
          <label style={s.label}>
            Must-do <span style={{ fontWeight: 400, opacity: 0.55, fontSize: '13px' }}>(optional)</span>
          </label>
          <MustDoField
            spots={spots}
            disabled={!selectedCity}
            selected={mustDo}
            onChange={setMustDo}
          />
        </div>

        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!canGenerate}
          style={{
            width: '100%',
            marginTop: '8px',
            opacity: canGenerate ? 1 : 0.4,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? loadingMsg : '✨ Generate AI Itinerary'}
        </Button>
      </div>
    </div>
  )
}

const cal: Record<string, React.CSSProperties> = {
  wrap: { background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px', marginTop: '8px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  navBtn: { background: 'transparent', border: 'none', color: 'var(--cream)', fontSize: '20px', cursor: 'pointer', padding: '0 8px' },
  monthLabel: { fontFamily: "'Playfair Display', serif", fontSize: '15px', color: 'var(--cream)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' },
  dayName: { textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', padding: '3px 0' },
  day: { textAlign: 'center', padding: '6px 0', fontSize: '13px', borderRadius: '7px', border: 'none', background: 'transparent', color: 'var(--cream)', cursor: 'pointer' },
  daySelected: { background: 'var(--accent)', color: '#fff', fontWeight: 600 },
  dayInRange: { background: 'rgba(210, 120, 80, 0.2)' },
  dayPast: { opacity: 0.3, cursor: 'not-allowed' },
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: '860px', margin: '0 auto', padding: '36px 24px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px 40px' },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px', padding: 0 },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, marginBottom: '6px', color: 'var(--cream)' },
  sub: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' },
  section: { marginBottom: '22px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--cream)', marginBottom: '6px' },
  airportLabel: { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  airportGroup: { display: 'flex', flexDirection: 'column' },
  helperText: { fontSize: '12px', color: 'var(--accent)', marginBottom: '8px', marginTop: '0' },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--cream)',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
  } as React.CSSProperties,
  dateDisplay: { fontSize: '14px', color: 'var(--accent)', marginBottom: '6px', fontWeight: 500 },
  demoBox: { background: 'rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden' },
  demoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' },
  demoLabel: { fontSize: '14px', color: 'var(--cream)', fontWeight: 500 },
  demoSub: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' },
  counterRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  counterBtn: { width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--cream)', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counterVal: { fontSize: '15px', fontWeight: 600, color: 'var(--cream)', minWidth: '18px', textAlign: 'center' },
  personaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  personaRow: {
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid var(--border)',
    borderRadius: '10px',
    padding: '10px 12px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  personaActive: { border: '1.5px solid var(--accent)', background: 'rgba(210,120,80,0.12)' },
  personaIcon: { fontSize: '16px', flexShrink: 0 },
  personaTextWrap: { display: 'flex', flexDirection: 'column', gap: '1px' } as React.CSSProperties,
  personaLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--cream)' },
  personaDesc: { fontSize: '11px', color: 'var(--text-secondary)' },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 999,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '6px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    maxHeight: '280px',
    overflowY: 'auto',
  } as React.CSSProperties,
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    textAlign: 'left',
    padding: '9px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--cream)',
    fontSize: '14px',
  } as React.CSSProperties,
  dropdownCity: { fontWeight: 600, fontSize: '14px' },
  dropdownCountry: { color: 'var(--text-secondary)', fontSize: '13px' },
  dropdownEmpty: { padding: '12px 14px', fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(210,120,80,0.18)',
    border: '1px solid rgba(210,120,80,0.4)',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '12px',
    color: 'var(--cream)',
    fontWeight: 500,
  } as React.CSSProperties,
  chipRemove: { cursor: 'pointer', opacity: 0.7, marginLeft: '2px', fontSize: '14px', lineHeight: 1 },
  error: { background: 'rgba(196,107,107,0.12)', color: 'var(--error)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' },
}
