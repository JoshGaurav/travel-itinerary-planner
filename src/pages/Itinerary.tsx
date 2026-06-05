import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, Trip, ItineraryDay, Activity } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Input, TextArea } from '../components/Input'

const ACTIVITY_TYPES = [
  { id: 'sightseeing', label: 'Sightseeing', icon: '🏛', color: '#7C6AF7', bg: 'rgba(124,106,247,0.12)', border: 'rgba(124,106,247,0.3)' },
  { id: 'dining',      label: 'Dining',      icon: '🍽', color: '#4CAF82', bg: 'rgba(76,175,130,0.12)',  border: 'rgba(76,175,130,0.3)' },
  { id: 'adventure',   label: 'Adventure',   icon: '🧗', color: '#E07B4A', bg: 'rgba(224,123,74,0.12)',  border: 'rgba(224,123,74,0.3)' },
  { id: 'cruise',      label: 'Cruise',      icon: '⛵', color: '#4A9FD4', bg: 'rgba(74,159,212,0.12)',  border: 'rgba(74,159,212,0.3)' },
  { id: 'relaxing',    label: 'Relaxing',    icon: '🌿', color: '#D4A44A', bg: 'rgba(212,164,74,0.12)',  border: 'rgba(212,164,74,0.3)' },
  { id: 'kids',        label: 'Kids',        icon: '🎠', color: '#D45FA0', bg: 'rgba(212,95,160,0.12)',  border: 'rgba(212,95,160,0.3)' },
  { id: 'other',       label: 'Other',       icon: '📌', color: '#888',    bg: 'rgba(136,136,136,0.12)', border: 'rgba(136,136,136,0.3)' },
]

function TypePill({ type }: { type: string }) {
  const t = ACTIVITY_TYPES.find(t => t.id === type) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1]!
  return (
    <span style={{
      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
      borderRadius: '100px', background: t.bg, color: t.color,
      border: `1px solid ${t.border}`, letterSpacing: '0.04em',
      display: 'inline-flex', alignItems: 'center', gap: '4px',
    }}>
      <span>{t.icon}</span>{t.label}
    </span>
  )
}

function TripMap({ destination, activities }: { destination: string, activities: Activity[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      let center: [number, number] = [20, 0]
      let zoom = 2
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`
        )
        const data = await res.json()
        if (data[0]) {
          center = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
          zoom = 12
        }
      } catch {}

      const map = L.map(mapRef.current!).setView(center, zoom)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const activitiesWithCoords = activities.filter(a => a.latitude && a.longitude)
      activitiesWithCoords.forEach(activity => {
        const type = ACTIVITY_TYPES.find(t => t.id === activity.activity_type) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1]!
        const icon = L.divIcon({
          html: `<div style="
            width:32px;height:32px;border-radius:50%;
            background:${type.color};border:2.5px solid white;
            display:flex;align-items:center;justify-content:center;
            font-size:14px;box-shadow:0 3px 8px rgba(0,0,0,0.35);
          ">${type.icon}</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
        L.marker([activity.latitude!, activity.longitude!], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px;padding:4px;">
              <strong style="font-size:13px;color:#1a1714;">${activity.title}</strong>
              ${activity.start_time ? `<br/><span style="color:#c4845c;font-size:11px;font-weight:600;">${activity.start_time}</span>` : ''}
              ${activity.location ? `<br/><span style="color:#666;font-size:11px;">📍 ${activity.location}</span>` : ''}
            </div>
          `)
      })

      if (activitiesWithCoords.length === 0 && zoom === 12) {
        L.marker(center).addTo(map).bindPopup(`<strong>${destination}</strong>`).openPopup()
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [destination, activities])

  return (
    <div style={s.mapWrap}>
      <div style={s.mapHeader}>
        <div style={s.mapTitleRow}>
          <span style={s.mapIcon}>📍</span>
          <span style={s.mapTitle}>Map view</span>
        </div>
        <span style={s.mapSub}>Activities with coordinates appear as pins</span>
      </div>
      <div ref={mapRef} style={s.mapContainer} />
    </div>
  )
}

interface DayWithActivities extends ItineraryDay {
  activities: Activity[]
}

export function ItineraryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [days, setDays] = useState<DayWithActivities[]>([])
  const [loading, setLoading] = useState(true)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newType, setNewType] = useState('sightseeing')
  const [newLat, setNewLat] = useState('')
  const [newLng, setNewLng] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user || !id) return
    loadData()
  }, [user, id])

  const loadData = async () => {
    const [tripRes, daysRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('itinerary_days').select('*').eq('trip_id', id).order('day_number'),
    ])
    if (tripRes.error || !tripRes.data) { setLoading(false); return }
    setTrip(tripRes.data as Trip)
    if (daysRes.data && daysRes.data.length > 0) {
      const dayIds = daysRes.data.map((d: ItineraryDay) => d.id)
      const { data: activities } = await supabase
        .from('activities').select('*').in('day_id', dayIds).order('sort_order')
      const loaded = daysRes.data.map((d: ItineraryDay) => ({
        ...d,
        activities: (activities || []).filter((a: Activity) => a.day_id === d.id),
      }))
      setDays(loaded)
      if (loaded.length > 0) setActiveDay(loaded[0].id)
    }
    setLoading(false)
  }

  const allActivities = days.flatMap(d => d.activities)
  const totalActivities = allActivities.length

  const handleAddActivity = async (dayId: string) => {
    if (!newTitle.trim()) return
    const day = days.find(d => d.id === dayId)
    const { data } = await supabase.from('activities').insert({
      day_id: dayId,
      title: newTitle.trim(),
      start_time: newTime || null,
      location: newLocation.trim(),
      description: newDescription.trim(),
      activity_type: newType,
      latitude: newLat ? parseFloat(newLat) : null,
      longitude: newLng ? parseFloat(newLng) : null,
      sort_order: day ? day.activities.length : 0,
    }).select().single()
    if (data) {
      setDays(prev => prev.map(d =>
        d.id === dayId ? { ...d, activities: [...d.activities, data as Activity] } : d
      ))
    }
    setAddingTo(null)
    setNewTitle(''); setNewTime(''); setNewLocation('')
    setNewDescription(''); setNewType('sightseeing')
    setNewLat(''); setNewLng('')
  }

  const handleDeleteActivity = async (activityId: string, dayId: string) => {
    await supabase.from('activities').delete().eq('id', activityId)
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, activities: d.activities.filter(a => a.id !== activityId) } : d
    ))
  }

  const handleCopyItinerary = () => {
    if (!trip) return
    const text = days.map(day => {
      const header = `Day ${day.day_number} — ${formatDate(day.day_date)}`
      const acts = day.activities.map(a =>
        `  ${a.start_time ? formatTime(a.start_time) + ' · ' : ''}${a.title}${a.location ? ` @ ${a.location}` : ''}`
      ).join('\n')
      return `${header}\n${acts || '  (no activities yet)'}`
    }).join('\n\n')
    navigator.clipboard.writeText(`${trip.destination} Itinerary\n\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })

  const formatTime = (time: string | null) => {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hour = parseInt(h!)
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  if (loading) return (
    <div style={s.loadingWrap}>
      <div style={s.loadingCard}>
        <div style={s.loadingIcon}>✈</div>
        <p style={s.loadingText}>Loading your itinerary...</p>
      </div>
    </div>
  )
  if (!trip) return <div style={s.loadingWrap}><p style={s.loadingText}>Trip not found</p></div>

  const startFmt = new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endFmt = new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={s.page}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← My Trips</button>
        <div style={s.headerMain}>
          <div style={s.headerLeft}>
            <div style={s.eyebrowPill}>
              <span style={s.eyebrowDot} />
              Your Itinerary
            </div>
            <h1 style={s.heading}>{trip.destination}</h1>
            <p style={s.dates}>{startFmt} — {endFmt} · {days.length} days · {totalActivities} activities</p>
            {trip.notes && <p style={s.notes}>"{trip.notes}"</p>}
          </div>
          <div style={s.headerActions}>
            <button
              style={s.iconBtn}
              onClick={() => setShowMap(m => !m)}
              title="Toggle map"
            >
              {showMap ? '🗺 Hide map' : '🗺 Show map'}
            </button>
            <button
              style={{ ...s.iconBtn, ...(copied ? s.iconBtnSuccess : {}) }}
              onClick={handleCopyItinerary}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={s.statsRow}>
        {[
          { icon: '📅', label: 'Days', value: days.length },
          { icon: '🎯', label: 'Activities', value: totalActivities },
          { icon: '🏛', label: 'Sightseeing', value: allActivities.filter(a => a.activity_type === 'sightseeing').length },
          { icon: '🍽', label: 'Dining', value: allActivities.filter(a => a.activity_type === 'dining').length },
        ].map((stat, i) => (
          <div key={i} style={s.statCard}>
            <span style={s.statIcon}>{stat.icon}</span>
            <span style={s.statValue}>{stat.value}</span>
            <span style={s.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── MAP ── */}
      {showMap && <TripMap destination={trip.destination} activities={allActivities} />}

      {/* ── TYPE LEGEND ── */}
      <div style={s.legend}>
        {ACTIVITY_TYPES.filter(t => t.id !== 'other').map(t => (
          <span key={t.id} style={{ ...s.legendPill, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
            {t.icon} {t.label}
          </span>
        ))}
      </div>

      {/* ── DAY TABS ── */}
      <div style={s.dayTabs}>
        {days.map(day => (
          <button
            key={day.id}
            onClick={() => setActiveDay(day.id)}
            style={{
              ...s.dayTab,
              ...(activeDay === day.id ? s.dayTabActive : {}),
            }}
          >
            <span style={s.dayTabNum}>Day {day.day_number}</span>
            <span style={s.dayTabDate}>{new Date(day.day_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {day.activities.length > 0 && (
              <span style={{
                ...s.dayTabBadge,
                background: activeDay === day.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
              }}>{day.activities.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TIMELINE ── */}
      <div style={s.timeline}>
        {days.filter(d => !activeDay || d.id === activeDay).map(day => (
          <div key={day.id} style={s.daySection}>

            {/* Day header */}
            <div style={s.dayHeader}>
              <div style={s.dayBadge}>Day {day.day_number}</div>
              <h2 style={s.dayDate}>{formatDate(day.day_date)}</h2>
              <span style={s.activityCount}>
                {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
              </span>
            </div>

            <div style={s.activitiesList}>
              {day.activities.length === 0 && addingTo !== day.id && (
                <div style={s.emptyDay}>
                  <span style={s.emptyDayIcon}>🗓</span>
                  <p style={s.emptyDayText}>No activities yet — add your first one!</p>
                </div>
              )}

              {day.activities.map((activity, idx) => (
                <div key={activity.id} style={s.activityCard}>
                  {/* Timeline dot */}
                  <div style={s.timelineLeft}>
                    <div style={{
                      ...s.timelineDot,
                      background: ACTIVITY_TYPES.find(t => t.id === activity.activity_type)?.color || '#888',
                    }} />
                    {idx < day.activities.length - 1 && <div style={s.timelineLine} />}
                  </div>

                  <div style={s.activityInner}>
                    <div style={s.activityHeader}>
                      <div style={s.activityLeft}>
                        {activity.start_time && (
                          <span style={s.activityTime}>{formatTime(activity.start_time)}</span>
                        )}
                        <h4 style={s.activityTitle}>{activity.title}</h4>
                      </div>
                      <div style={s.activityRight}>
                        <TypePill type={activity.activity_type || 'other'} />
                        <button onClick={() => handleDeleteActivity(activity.id, day.id)} style={s.removeBtn} title="Remove">×</button>
                      </div>
                    </div>
                    {activity.location && (
                      <p style={s.activityLocation}>📍 {activity.location}</p>
                    )}
                    {activity.description && (
                      <p style={s.activityDesc}>{activity.description}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Add form */}
              {addingTo === day.id ? (
                <div style={s.addForm}>
                  <p style={s.addFormTitle}>Add activity</p>
                  <Input
                    placeholder="Activity title *"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    autoFocus
                  />
                  <div style={s.typeGrid}>
                    {ACTIVITY_TYPES.map(t => (
                      <button key={t.id} onClick={() => setNewType(t.id)} style={{
                        ...s.typeBtn,
                        background: newType === t.id ? t.bg : 'transparent',
                        color: newType === t.id ? t.color : 'var(--text-secondary)',
                        border: newType === t.id ? `1px solid ${t.border}` : '1px solid var(--border)',
                      }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                  <div style={s.addRow}>
                    <Input placeholder="Time" type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ flex: 1 }} />
                    <Input placeholder="Location name" value={newLocation} onChange={e => setNewLocation(e.target.value)} style={{ flex: 1 }} />
                  </div>
                  <div style={s.addRow}>
                    <Input placeholder="Latitude (optional)" value={newLat} onChange={e => setNewLat(e.target.value)} style={{ flex: 1 }} />
                    <Input placeholder="Longitude (optional)" value={newLng} onChange={e => setNewLng(e.target.value)} style={{ flex: 1 }} />
                  </div>
                  <TextArea
                    placeholder="Description (optional)"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                  />
                  <div style={s.addActions}>
                    <Button size="sm" onClick={() => handleAddActivity(day.id)}>Add Activity</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingTo(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingTo(day.id)} style={s.addBtn}>
                  <span style={s.addBtnPlus}>+</span> Add activity
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  loadingWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  loadingCard: { textAlign: 'center' },
  loadingIcon: { fontSize: '40px', marginBottom: '16px' },
  loadingText: { color: 'var(--text-secondary)', fontSize: '15px' },

  page: { maxWidth: '900px', margin: '0 auto', padding: '48px 32px' },

  header: { marginBottom: '28px' },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0 },
  headerMain: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' },
  headerLeft: {},
  eyebrowPill: { display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(196,132,92,0.1)', border: '1px solid rgba(196,132,92,0.25)', borderRadius: '100px', padding: '5px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' },
  eyebrowDot: { width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '42px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '8px', color: 'var(--cream)' },
  dates: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' },
  notes: { color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', marginTop: '4px' },

  headerActions: { display: 'flex', gap: '8px', flexShrink: 0, marginTop: '4px' },
  iconBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '12px', padding: '8px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
  iconBtnSuccess: { color: 'var(--success)', borderColor: 'rgba(126,184,143,0.3)', background: 'rgba(126,184,143,0.08)' },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statIcon: { fontSize: '20px', marginBottom: '2px' },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: 'var(--cream)' },
  statLabel: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 },

  mapWrap: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px' },
  mapHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' },
  mapTitleRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  mapIcon: { fontSize: '16px' },
  mapTitle: { fontSize: '14px', fontWeight: 600, color: 'var(--cream)' },
  mapSub: { fontSize: '12px', color: 'var(--text-muted)' },
  mapContainer: { height: '320px', width: '100%' },

  legend: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' },
  legendPill: { fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.03em' },

  dayTabs: { display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' },
  dayTab: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '10px 16px', cursor: 'pointer', flexShrink: 0, minWidth: '72px', position: 'relative' },
  dayTabActive: { background: 'var(--accent)', border: '1px solid var(--accent)' },
  dayTabNum: { fontSize: '11px', fontWeight: 700, color: 'inherit', letterSpacing: '0.05em' },
  dayTabDate: { fontSize: '12px', color: 'inherit', opacity: 0.8 },
  dayTabBadge: { fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', borderRadius: '100px', padding: '1px 7px', marginTop: '2px' },

  timeline: { display: 'flex', flexDirection: 'column', gap: '24px' },
  daySection: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '22px', overflow: 'hidden' },
  dayHeader: { display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' },
  dayBadge: { background: 'var(--accent)', color: 'var(--warm-white)', fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '10px', flexShrink: 0 },
  dayDate: { fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 500, color: 'var(--cream)', flex: 1, margin: 0 },
  activityCount: { fontSize: '12px', color: 'var(--text-muted)' },

  activitiesList: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '0' },

  emptyDay: { textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  emptyDayIcon: { fontSize: '28px' },
  emptyDayText: { fontSize: '14px', color: 'var(--text-muted)' },

  activityCard: { display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '4px' },
  timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '14px', flexShrink: 0, width: '16px' },
  timelineDot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, border: '2px solid var(--bg-card)' },
  timelineLine: { width: '2px', flex: 1, background: 'var(--border)', minHeight: '24px', marginTop: '4px' },

  activityInner: { flex: 1, background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '14px 18px', marginBottom: '12px' },
  activityHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' },
  activityLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
  activityRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  activityTime: { fontSize: '11px', color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.05em' },
  activityTitle: { fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 600, color: 'var(--cream)', margin: 0 },
  activityLocation: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '2px' },
  activityDesc: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '6px' },
  removeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1, flexShrink: 0 },

  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1.5px dashed var(--border)', borderRadius: '14px', color: 'var(--text-muted)', padding: '12px 18px', fontSize: '13px', cursor: 'pointer', width: '100%', marginLeft: '28px', marginTop: '4px' },
  addBtnPlus: { fontSize: '16px', color: 'var(--accent)', fontWeight: 300 },

  addForm: { background: 'var(--bg-input)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', marginLeft: '28px', marginTop: '8px' },
  addFormTitle: { fontSize: '13px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
  typeGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  typeBtn: { fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '100px', cursor: 'pointer' },
  addRow: { display: 'flex', gap: '12px' },
  addActions: { display: 'flex', gap: '10px' },
}
