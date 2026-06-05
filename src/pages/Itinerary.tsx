import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, Trip, ItineraryDay, Activity } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Input, TextArea } from '../components/Input'

const ACTIVITY_TYPES = [
  { id: 'sightseeing', label: 'Sightseeing', color: '#7C6AF7', bg: 'rgba(124,106,247,0.15)' },
  { id: 'dining',      label: 'Dining',      color: '#4CAF82', bg: 'rgba(76,175,130,0.15)' },
  { id: 'adventure',   label: 'Adventure',   color: '#E07B4A', bg: 'rgba(224,123,74,0.15)' },
  { id: 'cruise',      label: 'Cruise',      color: '#4A9FD4', bg: 'rgba(74,159,212,0.15)' },
  { id: 'relaxing',    label: 'Relaxing',    color: '#D4A44A', bg: 'rgba(212,164,74,0.15)' },
  { id: 'kids',        label: 'Kids',        color: '#D45FA0', bg: 'rgba(212,95,160,0.15)' },
  { id: 'other',       label: 'Other',       color: '#888',    bg: 'rgba(136,136,136,0.15)' },
]

function TypePill({ type }: { type: string }) {
  const t = ACTIVITY_TYPES.find(t => t.id === type) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1]!
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, padding: '3px 10px',
      borderRadius: '20px', background: t.bg, color: t.color,
      border: `1px solid ${t.color}33`, letterSpacing: '0.03em',
    }}>
      {t.label}
    </span>
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
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newType, setNewType] = useState('sightseeing')

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
      setDays(daysRes.data.map((d: ItineraryDay) => ({
        ...d,
        activities: (activities || []).filter((a: Activity) => a.day_id === d.id),
      })))
    }
    setLoading(false)
  }

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
  }

  const handleDeleteActivity = async (activityId: string, dayId: string) => {
    await supabase.from('activities').delete().eq('id', activityId)
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, activities: d.activities.filter(a => a.id !== activityId) } : d
    ))
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

  if (loading) return <div style={s.loading}>Loading your itinerary...</div>
  if (!trip) return <div style={s.loading}>Trip not found</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← My Trips</button>
        <h1 style={s.heading}>{trip.destination}</h1>
        <p style={s.dates}>
          {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
          {' · '}{days.length} day{days.length !== 1 ? 's' : ''}
        </p>
        {trip.notes && <p style={s.notes}>{trip.notes}</p>}
      </div>

      {/* Activity type legend */}
      <div style={s.legend}>
        {ACTIVITY_TYPES.filter(t => t.id !== 'other').map(t => (
          <span key={t.id} style={{ ...s.legendPill, background: t.bg, color: t.color, border: `1px solid ${t.color}33` }}>
            {t.label}
          </span>
        ))}
      </div>

      <div style={s.timeline}>
        {days.map(day => (
          <div key={day.id} style={s.daySection}>
            <div style={s.dayHeader}>
              <div style={s.dayBadge}>Day {day.day_number}</div>
              <h2 style={s.dayDate}>{formatDate(day.day_date)}</h2>
              <span style={s.activityCount}>{day.activities.length} activities</span>
            </div>

            <div style={s.activitiesList}>
              {day.activities.map(activity => (
                <div key={activity.id} style={s.activityCard}>
                  <div style={s.activityTime}>
                    {activity.start_time ? formatTime(activity.start_time) : '--:--'}
                  </div>
                  <div style={s.activityContent}>
                    <div style={s.activityTopRow}>
                      <h4 style={s.activityTitle}>{activity.title}</h4>
                      <TypePill type={activity.activity_type || 'other'} />
                    </div>
                    {activity.location && (
                      <p style={s.activityLocation}>📍 {activity.location}</p>
                    )}
                    {activity.description && (
                      <p style={s.activityDesc}>{activity.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id, day.id)}
                    style={s.removeBtn}
                  >×</button>
                </div>
              ))}

              {addingTo === day.id ? (
                <div style={s.addForm}>
                  <Input
                    placeholder="Activity title"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    autoFocus
                  />
                  {/* Type selector */}
                  <div style={s.typeGrid}>
                    {ACTIVITY_TYPES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setNewType(t.id)}
                        style={{
                          ...s.typeBtn,
                          background: newType === t.id ? t.bg : 'transparent',
                          color: newType === t.id ? t.color : 'var(--text-secondary)',
                          border: newType === t.id ? `1px solid ${t.color}55` : '1px solid var(--border)',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div style={s.addRow}>
                    <Input
                      placeholder="Time"
                      type="time"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Input
                      placeholder="Location"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      style={{ flex: 1 }}
                    />
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
                  + Add activity
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
  loading: { textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' },
  page: { maxWidth: '900px', margin: '0 auto', padding: '48px 32px' },
  header: { marginBottom: '24px' },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', padding: 0 },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '40px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '8px', color: 'var(--cream)' },
  dates: { color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '4px' },
  notes: { color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', fontStyle: 'italic' },
  legend: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' },
  legendPill: { fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.03em' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '28px' },
  daySection: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' },
  dayHeader: { display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' },
  dayBadge: { background: 'var(--accent)', color: 'var(--warm-white)', fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '10px' },
  dayDate: { fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary)', flex: 1 },
  activityCount: { fontSize: '12px', color: 'var(--text-muted)' },
  activitiesList: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  activityCard: { display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '14px 18px', background: 'var(--bg-input)', borderRadius: '14px', border: '1px solid var(--border)' },
  activityTime: { color: 'var(--amber)', fontSize: '13px', fontWeight: 600, minWidth: '64px', paddingTop: '2px' },
  activityContent: { flex: 1 },
  activityTopRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' },
  activityTitle: { fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 600, color: 'var(--cream)', margin: 0 },
  activityLocation: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' },
  activityDesc: { fontSize: '13px', color: 'var(--text-secondary)' },
  removeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  addBtn: { background: 'transparent', border: '1px dashed var(--border)', borderRadius: '14px', color: 'var(--text-muted)', padding: '12px 18px', fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left' },
  addForm: { background: 'var(--bg-input)', borderRadius: '14px', border: '1px solid var(--border)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' },
  typeGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  typeBtn: { fontSize: '12px', fontWeight: 500, padding: '5px 14px', borderRadius: '20px', cursor: 'pointer' },
  addRow: { display: 'flex', gap: '14px' },
  addActions: { display: 'flex', gap: '10px' },
}
