import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import knowledgeBase from '../assets/gemini-code-1780667290332.json'

interface KBCity {
  id: string
  city: string
  aliases: string[]
  country: string
  airports: KBAirport[]
  popular_spots: KBSpot[]
}

interface KBAirport {
  iata: string
  name: string
  priority: number
  intl_visitor_use: boolean
}

interface KBSpot {
  name: string
  must_see: boolean
  priority: number
}

const KB_CITIES: KBCity[] = (knowledgeBase as { cities: KBCity[] }).cities

const FEATURED_CITIES = ['tokyo-jp', 'paris-fr', 'dubai-ae', 'barcelona-es', 'new-york-us', 'bali-id']

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

function normalise(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

function searchCities(query: string): KBCity[] {
  if (!query.trim()) return FEATURED_CITIES.map(id => KB_CITIES.find(c => c.id === id)!).filter(Boolean)
  const q = normalise(query)
  return KB_CITIES.filter(c =>
    normalise(c.city).includes(q) ||
    c.aliases.some(a => normalise(a).includes(q))
  ).slice(0, 8)
}

// City search dropdown
function CitySearch({
  value,
  onChange,
  onCitySelect,
}: {
  value: string
  onChange: (v: string) => void
  onCitySelect: (city: KBCity | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<KBCity[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResults(searchCities(value))
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (city: KBCity) => {
    onChange(`${city.city}, ${city.country}`)
    onCitySelect(city)
    setOpen(false)
  }

  const noMatch = value.trim().length > 0 && results.length === 0

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        style={s.input}
        placeholder="e.g. Paris, France"
        value={value}
        onChange={e => { onChange(e.target.value); onCitySelect(null); setOpen(true) }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <div style={s.dropdown}>
          {results.map(city => (
            <button
              key={city.id}
              style={s.dropdownItem}
              onMouseDown={() => handleSelect(city)}
            >
              <span style={s.dropdownCity}>{city.city}</span>
              <span style={s.dropdownCountry}>{city.country}</span>
            </button>
          ))}
          {noMatch && (
            <div style={s.dropdownNote}>City not in our list — you can still continue</div>
          )}
          {!value.trim() && results.length > 0 && (
            <div style={s.dropdownHint}>Popular destinations</div>
          )}
        </div>
      )}
    </div>
  )
}

// Airport selector
function AirportSelect({
  label,
  airports,
  disabled,
  value,
  onChange,
}: {
  label: string
  airports: KBAirport[]
  disabled: boolean
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [manual, setManual] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const sorted = [...airports].sort((a, b) => a.priority - b.priority)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reset manual mode when airports change
  useEffect(() => { setManual(false) }, [airports])

  if (manual) {
    return (
      <div style={s.fieldWrap}>
        <label style={s.fieldLabel}>{label}</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="e.g. JFK · John F. Kennedy International"
            value={value}
            onChange={e => onChange(e.target.value)}
            autoFocus
          />
          <button style={s.manualToggle} onClick={() => { setManual(false); onChange('') }}>
            List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.fieldWrap} ref={wrapRef}>
      <label style={s.fieldLabel}>{label}</label>
      <div
        style={{ ...s.selectTrigger, ...(disabled ? s.selectDisabled : {}) }}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        <span style={value ? { color: 'var(--cream)' } : { color: 'var(--text-muted)' }}>
          {value || (disabled ? 'Select city first' : 'Select airport')}
        </span>
        {!disabled && <span style={s.chevron}>{open ? '▲' : '▼'}</span>}
      </div>
      {open && !disabled && (
        <div style={s.dropdown}>
          {sorted.map(apt => (
            <button
              key={apt.iata}
              style={s.dropdownItem}
              onMouseDown={() => { onChange(`${apt.iata} · ${apt.name}`); setOpen(false) }}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 600, minWidth: '40px' }}>{apt.iata}</span>
              <span style={s.dropdownCountry}>{apt.name}</span>
            </button>
          ))}
          <button
            style={{ ...s.dropdownItem, borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '10px' }}
            onMouseDown={() => { setManual(true); setOpen(false); onChange('') }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>✏️ Enter airport manually</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Must-do multi-select
function MustDoSelect({
  spots,
  disabled,
  selected,
  onChange,
}: {
  spots: KBSpot[]
  disabled: boolean
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter(s => s !== name) : [...selected, name])
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div
        style={{ ...s.mustDoTrigger, ...(disabled ? s.selectDisabled : {}) }}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        {selected.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {disabled ? 'Select a city to see options' : 'Pick spots you want to include…'}
          </span>
        ) : (
          <div style={s.tagRow}>
            {selected.map(name => (
              <span key={name} style={s.tag}>
                {name}
                <button
                  style={s.tagX}
                  onMouseDown={e => { e.stopPropagation(); toggle(name) }}
                >×</button>
              </span>
            ))}
          </div>
        )}
        {!disabled && <span style={{ ...s.chevron, alignSelf: 'center' }}>{open ? '▲' : '▼'}</span>}
      </div>
      {open && !disabled && (
        <div style={{ ...s.dropdown, maxHeight: '220px', overflowY: 'auto' }}>
          {spots.map(spot => (
            <button
              key={spot.name}
              style={{ ...s.dropdownItem, ...(selected.includes(spot.name) ? s.dropdownSelected : {}) }}
              onMouseDown={() => toggle(spot.name)}
            >
              <span style={{ flex: 1, color: selected.includes(spot.name) ? 'var(--cream)' : 'var(--text-secondary)' }}>
                {spot.name}
              </span>
              {spot.must_see && <span style={s.mustStar}>★</span>}
              {selected.includes(spot.name) && <span style={{ color: 'var(--accent)', fontSize: '13px' }}>✓</span>}
            </button>
          ))}
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

export function CreateTripPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [destination, setDestination] = useState('')
  const [selectedCity, setSelectedCity] = useState<KBCity | null>(null)
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
  const canSubmit = totalTravellers >= 1 && destination.trim() && startDate && endDate

  const handleCitySelect = (city: KBCity | null) => {
    setSelectedCity(city)
    setArrivalAirport('')
    setDepartureAirport('')
    setMustDo([])
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
    if (totalTravellers < 1) return setError('Add at least 1 traveller to continue')

    setLoading(true)
    setLoadingMsg('Creating your trip...')

    const mustHavesText = mustDo.join(', ')

    const { data: trip, error: insertError } = await supabase
      .from('trips')
      .insert({
        user_id: user!.id,
        destination: destination.trim(),
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        notes: mustHavesText,
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
          must_haves: mustHavesText,
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
          prompt_text: `${destination} - ${persona || 'midrange'} - ${mustHavesText}`,
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

  const cityAirports = selectedCity?.airports ?? []
  const citySpots = selectedCity
    ? [...selectedCity.popular_spots].sort((a, b) => a.priority - b.priority)
    : []

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
          <CitySearch value={destination} onChange={setDestination} onCitySelect={handleCitySelect} />
        </div>

        {/* AIRPORTS */}
        <div style={s.twoCol}>
          <AirportSelect
            label="Arrival airport"
            airports={cityAirports}
            disabled={!selectedCity}
            value={arrivalAirport}
            onChange={setArrivalAirport}
          />
          <AirportSelect
            label="Departure airport"
            airports={cityAirports}
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
          {totalTravellers === 0 && (
            <p style={s.helperNote}>Add at least 1 traveller to continue</p>
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

        {/* TRAVEL PERSONA */}
        <div style={s.section}>
          <label style={s.label}>
            Travel persona <span style={{ fontWeight: 400, opacity: 0.55, fontSize: '13px' }}>(optional)</span>
          </label>
          <div style={s.personaList}>
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
                <span style={s.personaLabel}>{p.label}</span>
                <span style={s.personaDesc}>{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MUST-DO */}
        <div style={s.section}>
          <label style={s.label}>
            Must-do <span style={{ fontWeight: 400, opacity: 0.55, fontSize: '13px' }}>(optional)</span>
          </label>
          <MustDoSelect
            spots={citySpots}
            disabled={!selectedCity}
            selected={mustDo}
            onChange={setMustDo}
          />
        </div>

        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
          style={{ width: '100%', marginTop: '4px' }}
        >
          {loading ? loadingMsg : '✨ Generate AI Itinerary'}
        </Button>
      </div>
    </div>
  )
}

const cal: Record<string, React.CSSProperties> = {
  wrap: { background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', marginTop: '6px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
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
  page: { maxWidth: '900px', margin: '0 auto', padding: '36px 24px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px 40px' },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0 },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: 'var(--cream)' },
  sub: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' },
  section: { marginBottom: '24px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--cream)', marginBottom: '6px' },
  helperNote: { fontSize: '12px', color: 'var(--warning)', marginBottom: '8px', marginTop: '-2px' },

  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--cream)' },
  selectTrigger: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '14px', minHeight: '42px', userSelect: 'none' },
  selectDisabled: { opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' as const },
  chevron: { fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px' },
  manualToggle: { padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },

  dropdown: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', zIndex: 200, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' },
  dropdownSelected: { background: 'rgba(196,132,92,0.1)' },
  dropdownCity: { color: 'var(--cream)', fontSize: '14px', fontWeight: 500 },
  dropdownCountry: { color: 'var(--text-muted)', fontSize: '12px' },
  dropdownNote: { padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' },
  dropdownHint: { padding: '6px 14px 8px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border)', order: -1 },
  mustStar: { color: 'var(--amber)', fontSize: '11px', marginRight: '4px' },

  mustDoTrigger: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: '42px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', gap: '8px', userSelect: 'none' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 },
  tag: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(196,132,92,0.18)', border: '1px solid rgba(196,132,92,0.4)', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', color: 'var(--cream)' },
  tagX: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 },

  dateDisplay: { fontSize: '13px', color: 'var(--accent)', marginBottom: '4px', fontWeight: 500 },
  demoBox: { background: 'rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden' },
  demoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid var(--border)' },
  demoLabel: { fontSize: '14px', color: 'var(--cream)', fontWeight: 500 },
  demoSub: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' },
  counterRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  counterBtn: { width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--cream)', fontSize: '17px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counterVal: { fontSize: '15px', fontWeight: 600, color: 'var(--cream)', minWidth: '20px', textAlign: 'center' },

  personaList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' },
  personaRow: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left' },
  personaActive: { border: '1.5px solid var(--accent)', background: 'rgba(210,120,80,0.12)' },
  personaIcon: { fontSize: '17px', flexShrink: 0 },
  personaLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--cream)', minWidth: '64px' },
  personaDesc: { fontSize: '12px', color: 'var(--text-secondary)' },

  error: { background: 'rgba(196,107,107,0.12)', color: 'var(--error)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' },
}
