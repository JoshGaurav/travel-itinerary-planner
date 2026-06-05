import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

export function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>Plan your next adventure</div>
          <h1 style={styles.heading}>
            Travel plans,<br />
            <span style={styles.gradient}>beautifully organized</span>
          </h1>
          <p style={styles.subheading}>
            Itinera helps you create detailed itineraries, manage activities day by day,
            and keep all your travel plans in one place.
          </p>
          <div style={styles.ctas}>
            {user ? (
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/signup')}>
                  Get started free
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                  Log in
                </Button>
              </>
            )}
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.mockCard}>
            <div style={styles.mockHeader}>
              <div style={styles.mockDot} />
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Tokyo, Japan</span>
            </div>
            <div style={styles.mockBody}>
              {['Visit Senso-ji Temple', 'Shibuya Crossing', 'Ramen at Ichiran', 'Tokyo Tower at sunset'].map((item, i) => (
                <div key={i} style={styles.mockItem}>
                  <div style={styles.mockTime}>{['09:00', '13:00', '15:00', '18:00'][i]}</div>
                  <div style={styles.mockActivity}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <h2 style={styles.featuresHeading}>Everything you need for the perfect trip</h2>
        <div style={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const features = [
  { icon: '🗺', title: 'Organized Itineraries', desc: 'Plan each day with activities, times, and locations all in one view.' },
  { icon: '📅', title: 'Flexible Scheduling', desc: 'Add, reorder, and adjust activities as your plans evolve.' },
  { icon: '📝', title: 'Trip Notes', desc: 'Keep important details, booking references, and reminders handy.' },
]

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 32px 60px',
    gap: '64px',
  },
  heroContent: {
    flex: 1,
    maxWidth: '520px',
  },
  badge: {
    display: 'inline-block',
    background: 'var(--accent-glow)',
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: '20px',
    marginBottom: '24px',
  },
  heading: {
    fontSize: '52px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-1.5px',
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  gradient: {
    background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subheading: {
    fontSize: '18px',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    marginBottom: '36px',
  },
  ctas: {
    display: 'flex',
    gap: '16px',
  },
  heroVisual: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  mockCard: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    width: '100%',
    maxWidth: '380px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  mockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  mockDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent)',
  },
  mockBody: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mockItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  mockTime: {
    fontSize: '12px',
    color: 'var(--accent)',
    fontWeight: 600,
    minWidth: '40px',
  },
  mockActivity: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  features: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 32px',
  },
  featuresHeading: {
    fontSize: '32px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '48px',
    letterSpacing: '-0.5px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '32px',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  featureIcon: {
    fontSize: '28px',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
}
