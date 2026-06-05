import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

const FEATURED = [
  {
    destination: 'Kyoto, Japan',
    days: 5,
    persona: 'Luxurious',
    image: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=600',
    highlights: ['Fushimi Inari Shrine', 'Tea ceremony in Gion', 'Arashiyama Bamboo Grove', 'Nishiki Market lunch'],
  },
  {
    destination: 'Lisbon, Portugal',
    days: 4,
    persona: 'Mid-range',
    image: 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=600',
    highlights: ['Alfama District walk', 'Pastéis de Belém', 'Tram 28 ride', 'Sunset at Miradouro'],
  },
  {
    destination: 'Bali, Indonesia',
    days: 7,
    persona: 'Adventure',
    image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=600',
    highlights: ['Tegalalang Rice Terraces', 'Mount Batur sunrise hike', 'Ubud Monkey Forest', 'Seminyak beach'],
  },
  {
    destination: 'New York, USA',
    days: 3,
    persona: 'Budget',
    image: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=600',
    highlights: ['Central Park morning', 'Brooklyn Bridge walk', 'Times Square evening', 'Pizza in Little Italy'],
  },
]

const PERSONA_COLORS: Record<string, { color: string; bg: string }> = {
  'Luxurious': { color: '#D4A44A', bg: 'rgba(212,164,74,0.15)' },
  'Mid-range': { color: '#4A9FD4', bg: 'rgba(74,159,212,0.15)' },
  'Adventure': { color: '#E07B4A', bg: 'rgba(224,123,74,0.15)' },
  'Budget':    { color: '#4CAF82', bg: 'rgba(76,175,130,0.15)' },
}

export function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
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
              <Button size="lg" onClick={() => navigate('/dashboard')}>Go to My Trips</Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/signup')}>Start planning free</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Sign in</Button>
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

      {/* Featured itineraries wall */}
      <section style={styles.featured}>
        <div style={styles.featuredHeader}>
          <div>
            <h2 style={styles.featuredHeading}>Featured itineraries</h2>
            <p style={styles.featuredSub}>Curated trips to spark your next adventure</p>
          </div>
          {!user && (
            <button onClick={() => navigate('/signup')} style={styles.featuredCta}>
              Create yours →
            </button>
          )}
        </div>
        <div style={styles.featuredGrid}>
          {FEATURED.map((trip, i) => {
            const pc = PERSONA_COLORS[trip.persona] || PERSONA_COLORS['Budget']!
            return (
              <div key={i} style={styles.featuredCard}>
                <div
                  style={{
                    ...styles.featuredImage,
                    backgroundImage: `url(${trip.image})`,
                  }}
                >
                  <span style={{ ...styles.personaBadge, background: pc.bg, color: pc.color, border: `1px solid ${pc.color}44` }}>
                    {trip.persona}
                  </span>
                </div>
                <div style={styles.featuredBody}>
                  <div style={styles.featuredTop}>
                    <h3 style={styles.featuredDest}>{trip.destination}</h3>
                    <span style={styles.featuredDays}>{trip.days} days</span>
                  </div>
                  <div style={styles.highlights}>
                    {trip.highlights.map((h, j) => (
                      <div key={j} style={styles.highlightRow}>
                        <span style={styles.highlightDot} />
                        <span style={styles.highlightText}>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <h2 style={styles.featuresHeading}>Plan with warmth, travel with ease</h2>
        <div style={styles.featureGrid}>
          {FEATURE_LIST.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      {!user && (
        <section style={styles.banner}>
          <h2 style={styles.bannerHeading}>Ready to plan your next trip?</h2>
          <p style={styles.bannerSub}>Join thousands of travelers who plan smarter with Itinera.</p>
          <Button size="lg" onClick={() => navigate('/signup')}>Start for free</Button>
        </section>
      )}

      <footer style={styles.footer}>
        <span style={styles.footerLogo}>Itinera</span>
        <span style={styles.footerText}>Travel beautifully planned.</span>
      </footer>
    </div>
  )
}

const FEATURE_LIST = [
  { icon: '🗺', title: 'Day-by-Day Itineraries', desc: 'Organize each day with activities, times, and places — see your whole trip at a glance.' },
  { icon: '✏', title: 'Flexible & Simple', desc: 'Add, rearrange, or remove activities whenever inspiration strikes. No rigidity, just flow.' },
  { icon: '📝', title: 'Notes & Details', desc: 'Keep booking references, reservation numbers, and little reminders all in one spot.' },
  { icon: '🤖', title: 'AI-Powered Planning', desc: 'Let our AI generate a full itinerary in seconds based on your persona and must-haves.' },
]

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh' },
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', padding: '72px 32px 80px', gap: '56px' },
  heroContent: { flex: 1, maxWidth: '520px' },
  heroEyebrow: { fontSize: '14px', fontWeight: 500, color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '52px', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.5px', color: 'var(--cream)', marginBottom: '20px' },
  subheading: { fontSize: '17px', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '36px' },
  ctas: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  heroVisual: { flex: 1, display: 'flex', justifyContent: 'center' },
  mockCard: { background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', width: '100%', maxWidth: '380px', overflow: 'hidden' },
  mockImage: { height: '120px', background: 'linear-gradient(135deg, #3d2e22 0%, #2a221c 50%, #3a302a 100%)', display: 'flex', alignItems: 'flex-end', padding: '12px 20px' },
  mockImageLabel: { fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: 'var(--cream)' },
  mockBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  mockDay: { fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' },
  mockItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 0' },
  mockTime: { fontSize: '13px', color: 'var(--amber)', fontWeight: 600, minWidth: '40px' },
  mockActivity: { fontSize: '14px', color: 'var(--text-secondary)' },

  featured: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px' },
  featuredHeader: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' },
  featuredHeading: { fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 700, color: 'var(--cream)', marginBottom: '6px' },
  featuredSub: { fontSize: '14px', color: 'var(--text-secondary)' },
  featuredCta: { background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', paddingBottom: '4px', borderBottom: '1px solid var(--accent)' },
  featuredGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  featuredCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' },
  featuredImage: { height: '160px', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-start', padding: '12px', justifyContent: 'flex-end' },
  personaBadge: { fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.03em' },
  featuredBody: { padding: '20px' },
  featuredTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  featuredDest: { fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 600, color: 'var(--cream)' },
  featuredDays: { fontSize: '12px', color: 'var(--accent)', fontWeight: 600 },
  highlights: { display: 'flex', flexDirection: 'column', gap: '8px' },
  highlightRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  highlightDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },
  highlightText: { fontSize: '13px', color: 'var(--text-secondary)' },

  features: { maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' },
  featuresHeading: { fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 700, textAlign: 'center', marginBottom: '48px', letterSpacing: '-0.3px', color: 'var(--cream)' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' },
  featureCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px' },
  featureIcon: { fontSize: '28px', marginBottom: '18px' },
  featureTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, marginBottom: '10px', color: 'var(--cream)' },
  featureDesc: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 },

  banner: { maxWidth: '1200px', margin: '0 auto 80px', padding: '60px 32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', textAlign: 'center' },
  bannerHeading: { fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, color: 'var(--cream)', marginBottom: '12px' },
  bannerSub: { fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' },

  footer: { maxWidth: '1200px', margin: '0 auto', padding: '40px 32px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' },
  footerLogo: { fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: 'var(--cream)' },
  footerText: { fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' },
}