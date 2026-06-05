import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, Trip } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'INR', symbol: '₹', rate: 83.5 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
]

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState(CURRENCIES[0]!)

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
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

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

  if (loading) return <div style={s.loading}>Loading your trips...</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>My Trips</h1>
          <p style={s.subheading}>
            {trips.length === 0
              ? "You haven't created any trips yet"
              : `${trips.length} trip${trips.length !== 1 ? 's' : ''} planned`}
          </p>
        </div>
        <div style={s.headerRight}>
          {/* Currency switcher */}
          <div style={s.currencyBar}>
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCurrency(c)}
                style={{
                  ...s.currencyBtn,
                  ...(currency.code === c.code ? s.currencyActive : {}),
                }}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
          <Button onClick={() => navigate('/trips/new')}>+ New Trip</Button>
        </div>
      </div>

      {/* Currency info bar */}
      {currency.code !== 'USD' && (
        <div style={s.rateBar}>
          <span style={s.rateText}>
            Showing costs in {currency.code} · 1 USD = {currency.symbol}{currency.rate.toFixed(2)}
          </span>
        </div>
      )}

      {trips.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>✈</div>
          <h2 style={s.emptyTitle}>No trips yet</h2>
          <p style={s.emptyDesc}>Create your first trip and start planning something wonderful.</p>
          <Button onClick={() => navigate('/trips/new')}>Plan your first trip</Button>
        </div>
      ) : (
        <div style={s.grid}>
          {trips.map((trip, i) => {
            const days = getDaysCount(trip.start_date, trip.end_date)
            const estCostUSD = days * 120
            const estCost = Math.round(estCostUSD * currency.rate)
            return (
              <div key={trip.id} style={s.card}>
                <div
                  style={{
                    ...s.cardImage,
                    backgroundImage: `url(${trip.cover_image || coverImages[i % coverImages.length]})`,
                  }}
                />
                <div style={s.cardBody}>
                  <h3 style={s.cardTitle}>{trip.destination}</h3>
                  <p style={s.cardDates}>
                    {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                  </p>
                  <div style={s.cardMeta}>
                    <span style={s.cardDays}>
                      {days} day{days !== 1 ? 's' : ''}
                    </span>
                    <span style={s.cardCost}>
                      Est. {currency.symbol}{estCost.toLocaleString()}
                    </span>
                  </div>
                  <div style={s.cardActions}>
                    <Link to={`/trips/${trip.id}`} style={s.viewBtn}>
                      View Itinerary
                    </Link>
                    <button onClick={() => handleDelete(trip.id)} style={s.deleteBtn}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  loading: { textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' },
  page: { maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--cream)' },
  subheading: { color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  currencyBar: { display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' },
  currencyBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s' },
  currencyActive: { background: 'var(--accent)', color: 'var(--warm-white)', fontWeight: 700 },
  rateBar: { background: 'rgba(210,120,80,0.08)', border: '1px solid rgba(210,120,80,0.2)', borderRadius: '10px', padding: '8px 16px', marginBottom: '24px' },
  rateText: { fontSize: '13px', color: 'var(--accent)' },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyIcon: { fontSize: '48px', marginBottom: '20px' },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, marginBottom: '10px', color: 'var(--cream)' },
  emptyDesc: { color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '28px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' },
  cardImage: { height: '168px', backgroundSize: 'cover', backgroundPosition: 'center' },
  cardBody: { padding: '24px' },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--cream)' },
  cardDates: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' },
  cardMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  cardDays: { fontSize: '12px', color: 'var(--accent)', fontWeight: 600 },
  cardCost: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 },
  cardActions: { display: 'flex', gap: '12px' },
  viewBtn: { display: 'inline-flex', alignItems: 'center', background: 'var(--accent)', color: 'var(--warm-white)', borderRadius: '12px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' },
  deleteBtn: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', padding: '9px 20px', fontSize: '13px', cursor: 'pointer' },
}