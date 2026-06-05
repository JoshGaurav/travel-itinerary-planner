import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, Trip, ItineraryDay, Activity } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Input, TextArea } from '../components/Input'

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

  useEffect(() => {
    if (!user || !id) return
    loadData()
  }, [user, id])

  const loadData = async () => {
    const [tripRes, daysRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('itinerary_days').select('*').eq('trip_id', id).order('day_number'),
    ])

    if (tripRes.error || !tripRes.data) {
      setLoading(false)
      return
    }

    setTrip(tripRes.data as Trip)

    if (daysRes.data && daysRes.data.length > 0) {
      const dayIds = daysRes.data.map((d: ItineraryDay) => d.id)
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .in('day_id', dayIds)
        .order('sort_order')

      const daysWithActivities: DayWithActivities[] = daysRes.data.map((d: ItineraryDay) => ({
        ...d,
        activities: (activities || []).filter((a: Activity) => a.day_id === d.id),
      }))

      setDays(daysWithActivities)
    }

    setLoading(false)
  }

  const handleAddActivity = async (dayId: string) => {
    if (!newTitle.trim()) return

    const day = days.find((d) => d.id === dayId)
    const sortOrder = day ? day.activities.length : 0

    const { data } = await supabase
      .from('activities')
      .insert({
        day_id: dayId,
        title: newTitle.trim(),
        start_time: newTime || null,
        location: newLocation.trim(),
        description: newDescription.trim(),
        sort_order: sortOrder,
      })
      .select()
      .single()

    if (data) {
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, activities: [...d.activities, data as Activity] } : d
        )
      )
    }

    setAddingTo(null)
    setNewTitle('')
    setNewTime('')
    setNewLocation('')
    setNewDescription('')
  }

  const handleDeleteActivity = async (activityId: string, dayId: string) => {
    await supabase.from('activities').delete().eq('id', activityId)
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) }
          : d
      )
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (time: string | null) => {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hour = parseInt(h!)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${m} ${ampm}`
  }

  if (loading) {
    return <div style={styles.loading}>Loading your itinerary...</div>
  }

  if (!trip) {
    return <div style={styles.loading}>Trip not found</div>
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            &larr; My Trips
          </button>
          <h1 style={styles.heading}>{trip.destination}</h1>
          <p style={styles.dates}>
            {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            {' '} &middot; {days.length} day{days.length !== 1 ? 's' : ''}
          </p>
          {trip.notes && <p style={styles.notes}>{trip.notes}</p>}
        </div>
      </div>

      <div style={styles.timeline}>
        {days.map((day) => (
          <div key={day.id} style={styles.daySection}>
            <div style={styles.dayHeader}>
              <div style={styles.dayBadge}>Day {day.day_number}</div>
              <h2 style={styles.dayDate}>{formatDate(day.day_date)}</h2>
            </div>

            <div style={styles.activitiesList}>
              {day.activities.map((activity) => (
                <div key={activity.id} style={styles.activityCard}>
                  <div style={styles.activityTime}>
                    {activity.start_time ? formatTime(activity.start_time) : '--:--'}
                  </div>
                  <div style={styles.activityContent}>
                    <h4 style={styles.activityTitle}>{activity.title}</h4>
                    {activity.location && (
                      <p style={styles.activityLocation}>{activity.location}</p>
                    )}
                    {activity.description && (
                      <p style={styles.activityDesc}>{activity.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id, day.id)}
                    style={styles.removeBtn}
                    title="Remove activity"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {addingTo === day.id ? (
                <div style={styles.addForm}>
                  <Input
                    placeholder="Activity title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                  <div style={styles.addRow}>
                    <Input
                      placeholder="Time"
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Input
                      placeholder="Location"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                  <TextArea
                    placeholder="Description (optional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                  <div style={styles.addActions}>
                    <Button size="sm" onClick={() => handleAddActivity(day.id)}>
                      Add Activity
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingTo(day.id)} style={styles.addBtn}>
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

const styles: Record<string, React.CSSProperties> = {
  loading: {
    textAlign: 'center',
    padding: '80px',
    color: 'var(--text-secondary)',
  },
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '48px 32px',
  },
  header: {
    marginBottom: '44px',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '16px',
    padding: 0,
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '40px',
    fontWeight: 700,
    letterSpacing: '-1px',
    marginBottom: '8px',
    color: 'var(--cream)',
  },
  dates: {
    color: 'var(--text-secondary)',
    fontSize: '15px',
    marginBottom: '4px',
  },
  notes: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    marginTop: '8px',
    fontStyle: 'italic',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  daySection: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    overflow: 'hidden',
  },
  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
  },
  dayBadge: {
    background: 'var(--accent)',
    color: 'var(--warm-white)',
    fontSize: '12px',
    fontWeight: 700,
    padding: '5px 12px',
    borderRadius: '10px',
    letterSpacing: '0.02em',
  },
  dayDate: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  activitiesList: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  activityCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '18px',
    padding: '14px 18px',
    background: 'var(--bg-input)',
    borderRadius: '14px',
    border: '1px solid var(--border)',
  },
  activityTime: {
    color: 'var(--amber)',
    fontSize: '13px',
    fontWeight: 600,
    minWidth: '64px',
    paddingTop: '2px',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '2px',
    color: 'var(--cream)',
  },
  activityLocation: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '2px',
  },
  activityDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    transition: 'color 0.25s',
  },
  addBtn: {
    background: 'transparent',
    border: '1px dashed var(--border)',
    borderRadius: '14px',
    color: 'var(--text-muted)',
    padding: '12px 18px',
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.25s',
  },
  addForm: {
    background: 'var(--bg-input)',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  addRow: {
    display: 'flex',
    gap: '14px',
  },
  addActions: {
    display: 'flex',
    gap: '10px',
  },
}
