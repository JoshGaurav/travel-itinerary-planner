import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

export function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <p style={styles.heroEyebrow}>Your journey starts here</p>
          <h1 style={styles.heading}>
            Where will your<br />
            next story take you?
          </h1>
          <p style={styles.subheading}>
            Itinera helps you craft thoughtful itineraries — day by day, moment by moment —
            so you can focus on the experience, not the planning.
          </p>
          <div style={styles.ctas}>
            {user ? (
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Go to My Trips
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/signup')}>
                  Start planning free
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.mockCard}>
            <div style={styles.mockImage}>
              <span style={styles.mockImageLabel}>Kyoto, Japan</span>
            </div>
            <div style={styles.mockBody}>
              <p style={styles.mockDay}>Day 1 — Morning</p>
              {[
                { time: '8:00', activity: 'Fushimi Inari Shrine' },
                { time: '11:30', activity: 'Tea ceremony in Gion' },
                { time: '1:00', activity: 'Lunch at Nishiki Market' },
              ].map((item, i) => (
                <div key={i} style={styles.mockItem}>
                  <span style={styles.mockTime}>{item.time}</span>
                  <span style={styles.mockActivity}>{item.activity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <h2 style={styles.featuresHeading}>Plan with warmth, travel with ease</h2>
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

      <footer style={styles.footer}>
        <span style={styles.footerLogo}>Itinera</span>
        <span style={styles.footerText}>Travel beautifully planned.</span>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: '🗺',
    title: 'Day-by-Day Itineraries',
    desc: 'Organize each day with activities, times, and places — see your whole trip at a glance.',
  },
  {
    icon: '✏',
    title: 'Flexible & Simple',
    desc: 'Add, rearrange, or remove activities whenever inspiration strikes. No rigidity, just flow.',
  },
  {
    icon: '📝',
    title: 'Notes & Details',
    desc: 'Keep booking references, reservation numbers, and little reminders all in one spot.',
  },
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
    padding: '72px 32px 80px',
    gap: '56px',
  },
  heroOverlay: {},
  heroContent: {
    flex: 1,
    maxWidth: '520px',
  },
  heroEyebrow: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--accent)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '20px',
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '52px',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.5px',
    color: 'var(--cream)',
    marginBottom: '20px',
  },
  subheading: {
    fontSize: '17px',
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
    marginBottom: '36px',
  },
  ctas: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  heroVisual: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  mockCard: {
    background: 'var(--bg-card)',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    width: '100%',
    maxWidth: '380px',
    overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(196, 132, 92, 0.08)',
  },
  mockImage: {
    height: '120px',
    background: 'linear-gradient(135deg, #3d2e22 0%, #2a221c 50%, #3a302a 100%)',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '12px 20px',
  },
  mockImageLabel: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--cream)',
  },
  mockBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mockDay: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  mockItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '6px 0',
  },
  mockTime: {
    fontSize: '13px',
    color: 'var(--amber)',
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
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '34px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '48px',
    letterSpacing: '-0.3px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '36px',
    transition: 'transform 0.25s, border-color 0.25s',
  },
  featureIcon: {
    fontSize: '28px',
    marginBottom: '18px',
  },
  featureTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '10px',
    color: 'var(--cream)',
  },
  featureDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
  },
  footer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 32px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  footerLogo: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--cream)',
  },
  footerText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
}


export { LandingPage }