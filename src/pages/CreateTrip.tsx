import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Input, TextArea } from '../components/Input'
import { Button } from '../components/Button'

export function CreateTripPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!destination.trim()) {
      setError('Destination is required')
      return
    }

    if (!startDate || !endDate) {
      setError('Start and end dates are required')
      return
    }

    if (new Date(endDate + 'T00:00:00') < new Date(startDate + 'T00:00:00')) {
      setError('End date must be on or after start date')
      return
    }

    setLoading(true)

    const { data: trip, error: insertError } = await supabase
      .from('trips')
      .insert({
        user_id: user!.id,
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        notes: notes.trim(),
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    const days: { trip_id: string; day_date: string; day_number: number; notes: string }[] = []
    let current = new Date(start)
    let dayNum = 1

    while (current <= end) {
      days.push({
        trip_id: trip.id,
        day_date: current.toISOString().split('T')[0]!,
        day_number: dayNum,
        notes: '',
      })
      current.setDate(current.getDate() + 1)
      dayNum++
    }

    await supabase.from('itinerary_days').insert(days)
    navigate(`/trips/${trip.id}`)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          &larr; Back to My Trips
        </button>

        <h1 style={styles.heading}>Plan a New Trip</h1>
        <p style={styles.subheading}>Where are you headed? Fill in the details to get started.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <Input
            label="Destination"
            placeholder="e.g. Tuscany, Italy"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />

          <div style={styles.row}>
            <Input
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={styles.dateInput}
            />
            <Input
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={styles.dateInput}
            />
          </div>

          <TextArea
            label="Notes (optional)"
            placeholder="Booking references, reminders, ideas..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '8px' }}>
            Create Trip
          </Button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '48px 32px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '44px',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '28px',
    padding: 0,
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '30px',
    fontWeight: 700,
    letterSpacing: '-0.3px',
    marginBottom: '8px',
    color: 'var(--cream)',
  },
  subheading: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginBottom: '36px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  dateInput: {
    flex: 1,
  },
  error: {
    background: 'rgba(196, 107, 107, 0.12)',
    color: 'var(--error)',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
  },
}
