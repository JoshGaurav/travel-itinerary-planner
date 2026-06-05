import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, Trip } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadTrips()
  }, [user])

  const loadTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: true })

    if (data) setTrips(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('trips').delete().eq('id', id)
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysCount = (start: string, end: string) => {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T00:00:00')
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const coverImages = [
    'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3155667/pexels-photo-3155667.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1291965/pexels-photo-1291965.jpeg?auto=compress&cs=tinysrgb&w=600',
  ]

  if (loading) {
    return <div style={styles.loading}>Loading your trips...</div>
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>My Trips</h1>
          <p style={styles.subheading}>
            {trips.length === 0
              ? "You haven't created any trips yet"
              : `${trips.length} trip${trips.length !== 1 ? 's' : ''} planned`}
          </p>
        </div>
        <Button onClick={() => navigate('/trips/new')}>+ New Trip</Button>
      </div>

      {trips.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>✈</div>
          <h2 style={styles.emptyTitle}>No trips yet</h2>
          <p style={styles.emptyDesc}>Create your first trip and start planning something wonderful.</p>
          <Button onClick={() => navigate('/trips/new')}>Plan your first trip</Button>
        </div>
      ) : (
        <div style={styles.grid}>
          {trips.map((trip, i) => (
            <div key={trip.id} style={styles.card}>
              <div
                style={{
                  ...styles.cardImage,
                  backgroundImage: `url(${trip.cover_image || coverImages[i % coverImages.length]})`,
                }}
              />
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{trip.destination}</h3>
                <p style={styles.cardDates}>
                  {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                </p>
                <p style={styles.cardDays}>
                  {getDaysCount(trip.start_date, trip.end_date)} day{getDaysCount(trip.start_date, trip.end_date) !== 1 ? 's' : ''}
                </p>
                <div style={styles.cardActions}>
                  <Link to={`/trips/${trip.id}`} style={styles.viewBtn}>
                    View Itinerary
                  </Link>
                  <button onClick={() => handleDelete(trip.id)} style={styles.deleteBtn}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 32px',
  },
  loading: {
    textAlign: 'center',
    padding: '80px',
    color: 'var(--text-secondary)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '48px',
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '36px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: 'var(--cream)',
  },
  subheading: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginTop: '4px',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '26px',
    fontWeight: 600,
    marginBottom: '10px',
    color: 'var(--cream)',
  },
  emptyDesc: {
    color: 'var(--text-secondary)',
    fontSize: '15px',
    marginBottom: '28px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'transform 0.25s, border-color 0.25s',
    cursor: 'default',
  },
  cardImage: {
    height: '168px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  cardBody: {
    padding: '24px',
  },
  cardTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '8px',
    color: 'var(--cream)',
  },
  cardDates: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  cardDays: {
    fontSize: '12px',
    color: 'var(--accent)',
    fontWeight: 600,
    marginBottom: '20px',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
  },
  viewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'var(--accent)',
    color: 'var(--warm-white)',
    borderRadius: '12px',
    padding: '9px 20px',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.25s',
    boxShadow: '0 2px 8px rgba(196, 132, 92, 0.2)',
  },
  deleteBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '9px 20px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
}
