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
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Your Trips</h1>
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
          <p style={styles.emptyDesc}>Create your first trip and start planning your itinerary.</p>
          <Button onClick={() => navigate('/trips/new')}>Create your first trip</Button>
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
                    Delete
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
    padding: '40px 32px',
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
    marginBottom: '40px',
  },
  heading: {
    fontSize: '32px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
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
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  emptyDesc: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s, border-color 0.2s',
    cursor: 'default',
  },
  cardImage: {
    height: '160px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  cardBody: {
    padding: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '6px',
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
    marginBottom: '16px',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
  },
  viewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background 0.2s',
  },
  deleteBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}
