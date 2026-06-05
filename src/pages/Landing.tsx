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

const PERSONA_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'Luxurious': { color: '#D4A44A', bg: 'rgba(212,164,74,0.12)', border: 'rgba(212,164,74,0.35)' },
  'Mid-range': { color: '#4A9FD4', bg: 'rgba(74,159,212,0.12)', border: 'rgba(74,159,212,0.35)' },
  'Adventure': { color: '#E07B4A', bg: 'rgba(224,123,74,0.12)', border: 'rgba(224,123,74,0.35)' },
  'Budget':    { color: '#4CAF82', bg: 'rgba(76,175,130,0.12)', border: 'rgba(76,175,130,0.35)' },
}

const STATS = [
  { value: '10K+', label: 'Trips planned' },
  { value: '190+', label: 'Countries covered' },
  { value: '4.9★', label: 'Avg. rating' },
]

const FEATURE_LIST = [
  { icon: '🗺', title: 'Day-by-Day Itineraries', desc: 'Organize each day with activities, times, and places — see your whole trip at a glance.' },
  { icon: '✏', title: 'Flexible & Simple', desc: 'Add, rearrange, or remove activities whenever inspiration strikes. No rigidity, just flow.' },
  { icon: '📝', title: 'Notes & Details', desc: 'Keep booking references, reservation numbers, and little reminders all in one spot.' },
  { icon: '🤖', title: 'AI-Powered Planning', desc: 'Let our AI generate a full itinerary in seconds based on your persona and must-haves.' },
]

export function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={styles.page}>

      {/* ── NAV ── */}
      <nav style={styles.nav}>
        <span style={styles.navLogo}>Itinera</span>
        <div style={styles.navLinks}>
          {user ? (
            <Button size="lg" onClick={() => navigate('/dashboard')}>My Trips</Button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={styles.navGhost}>Sign in</button>
              <Button onClick={() => navigate('/signup')}>Start free</Button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        {/* Left */}
        <div style={styles.heroContent}>
          <div style={styles.eyebrowPill}>
            <span style={styles.eyebrowDot} />
            Your journey starts here
          </div>
          <h1 style={styles.heading}>
            Where will your<br />
            <span style={styles.headingAccent}>next story</span> take you?
          </h1>
          <p style={styles.subheading}>
            Craft thoughtful itineraries — day by day, moment by moment —
            so you can focus on the experience, not the planning.
          </p>

          {/* Stats row */}
          <div style={styles.statsRow}>
            {STATS.map((s, i) => (
              <div key={i} style={styles.statItem}>
                <span style={styles.statValue}>{s.value}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={styles.ctas}>
            {user ? (
              <Button size="lg" onClick={() => navigate('/dashboard')}>Go to My Trips →</Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/signup')}>Start planning free</Button>
                <button style={styles.ghostBtn} onClick={() => navigate('/login')}>Sign in</button>
              </>
            )}
          </div>
        </div>

        {/* Right — mock itinerary card */}
        <div style={styles.heroVisual}>
          {/* Floating badge */}
          <div style={styles.floatingBadge}>
            <span style={styles.floatingDot} />
            AI generating your trip...
          </div>
          <div style={styles.mockCard}>
            <div style={styles.mockImageWrap}>
              <img
                src="https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Kyoto"
                style={styles.mockImg}
              />
              <div style={styles.mockImgOverlay}>
                <span style={styles.mockImgLabel}>Kyoto, Japan</span>
                <span style={styles.mockDaysBadge}>5 days</span>
              </div>
            </div>
            <div style={styles.mockBody}>
              <p style={styles.mockDay}>Day 1 — Morning</p>
              {[
                { time: '8:00', activity: 'Fushimi Inari Shrine', icon: '⛩' },
                { time: '11:30', activity: 'Tea ceremony in Gion', icon: '🍵' },
                { time: '13:00', activity: 'Lunch at Nishiki Market', icon: '🍜' },
              ].map((item, i) => (
                <div key={i} style={styles.mockItem}>
                  <span style={styles.mockIcon}>{item.icon}</span>
                  <div style={styles.mockItemText}>
                    <span style={styles.mockTime}>{item.time}</span>
                    <span style={styles.mockActivity}>{item.activity}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div style={styles.mockProgress}>
              <div style={styles.mockProgressFill} />
            </div>
          </div>
          {/* Second floating card */}
          <div style={styles.floatingMini}>
            <span style={{ fontSize: '18px' }}>✈️</span>
            <div>
              <p style={styles.floatingMiniTitle}>Next: Arashiyama</p>
              <p style={styles.floatingMiniSub}>2.4 km · 30 min walk</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section style={styles.featured}>
        <div style={styles.sectionLabel}>Featured itineraries</div>
        <div style={styles.featuredHeaderRow}>
          <h2 style={styles.sectionHeading}>Trips to spark your wanderlust</h2>
          {!user && (
            <button onClick={() => navigate('/signup')} style={styles.featuredCta}>
              Create yours →
            </button>
          )}
        </div>
        <div style={styles.featuredGrid}>
          {FEATURED.map((trip, i) => {
            const pc = PERSONA_COLORS[trip.persona] ?? PERSONA_COLORS['Budget']!
            return (
              <div key={i} style={styles.featuredCard} className="trip-card">
                <div style={{ ...styles.featuredImage, backgroundImage: `url(${trip.image})` }}>
                  <span style={{ ...styles.personaBadge, background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
                    {trip.persona}
                  </span>
                  <div style={styles.featuredOverlay}>
                    <h3 style={styles.featuredDest}>{trip.destination}</h3>
                    <span style={styles.featuredDaysChip}>{trip.days} days</span>
                  </div>
                </div>
                <div style={styles.featuredBody}>
                  {trip.highlights.map((h, j) => (
                    <div key={j} style={styles.highlightRow}>
                      <span style={{ ...styles.highlightDot, background: pc.color }} />
                      <span style={styles.highlightText}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={styles.features}>
        <div style={styles.sectionLabel}>Why Itinera</div>
        <h2 style={styles.sectionHeading}>Plan with warmth, travel with ease</h2>
        <div style={styles.featureGrid}>
          {FEATURE_LIST.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIconWrap}>
                <span style={styles.featureIcon}>{f.icon}</span>
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      {!user && (
        <section style={styles.banner}>
          <div style={styles.bannerInner}>
            <div style={styles.bannerGlowDot} />
            <p style={styles.bannerEyebrow}>Join thousands of travelers</p>
            <h2 style={styles.bannerHeading}>Ready to plan your next trip?</h2>
            <p style={styles.bannerSub}>Itinera is free to start. No credit card required.</p>
            <div style={styles.bannerCtas}>
              <Button size="lg" onClick={() => navigate('/signup')}>Start for free →</Button>
              <button style={styles.ghostBtn} onClick={() => navigate('/login')}>Already have an account</button>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>Itinera</span>
        <span style={styles.footerText}>Travel beautifully planned.</span>
        <span style={styles.footerRight}>© 2025 Itinera</span>
      </footer>

      {/* Hover styles injected globally */}
      <style>{`
        .trip-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .trip-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)' },

  // Nav
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', padding: '20px 32px' },
  navLogo: { fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.3px' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '12px' },
  navGhost: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '8px 12px' },

  // Hero
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', padding: '48px 32px 80px', gap: '64px' },
  heroContent: { flex: 1, maxWidth: '520px' },

  eyebrowPill: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(196,132,92,0.1)', border: '1px solid rgba(196,132,92,0.25)', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '24px' },
  eyebrowDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },

  heading: { fontFamily: "'Playfair Display', serif", fontSize: '54px', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.5px', color: 'var(--cream)', marginBottom: '20px' },
  headingAccent: { color: 'var(--accent)' },
  subheading: { fontSize: '17px', lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: '36px', maxWidth: '440px' },

  statsRow: { display: 'flex', gap: '32px', marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid var(--border)' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: 'var(--cream)' },
  statLabel: { fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.03em' },

  ctas: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  ghostBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' },

  // Hero visual
  heroVisual: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '420px' },
  floatingBadge: { position: 'absolute', top: '0px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '100px', padding: '8px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, zIndex: 2 },
  floatingDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 },

  mockCard: { background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', width: '100%', maxWidth: '360px', overflow: 'hidden', zIndex: 1 },
  mockImageWrap: { position: 'relative', height: '180px', overflow: 'hidden' },
  mockImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  mockImgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' },
  mockImgLabel: { fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: '#fff' },
  mockDaysBadge: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', color: '#fff', fontWeight: 600, backdropFilter: 'blur(4px)' },
  mockBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  mockDay: { fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px' },
  mockItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '12px' },
  mockIcon: { fontSize: '16px', flexShrink: 0 },
  mockItemText: { display: 'flex', flexDirection: 'column', gap: '1px' },
  mockTime: { fontSize: '11px', color: 'var(--amber)', fontWeight: 700 },
  mockActivity: { fontSize: '13px', color: 'var(--text-secondary)' },
  mockProgress: { height: '3px', background: 'var(--bg-secondary)', margin: '0 20px 20px' },
  mockProgressFill: { height: '100%', width: '35%', background: 'var(--accent)', borderRadius: '2px' },

  floatingMini: { position: 'absolute', bottom: '20px', left: '-16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '12px 16px', zIndex: 2 },
  floatingMiniTitle: { fontSize: '13px', fontWeight: 600, color: 'var(--cream)', margin: 0 },
  floatingMiniSub: { fontSize: '11px', color: 'var(--text-muted)', margin: 0 },

  // Featured
  featured: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px' },
  sectionLabel: { fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' },
  sectionHeading: { fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 700, color: 'var(--cream)', marginBottom: '0', letterSpacing: '-0.3px' },
  featuredHeaderRow: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' },
  featuredCta: { background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', paddingBottom: '2px', borderBottom: '1px solid var(--accent)' },

  featuredGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  featuredCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer' },
  featuredImage: { height: '180px', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px' },
  personaBadge: { alignSelf: 'flex-end', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.04em' },
  featuredOverlay: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)', margin: '-12px', padding: '40px 12px 12px' },
  featuredDest: { fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 600, color: '#fff', margin: 0 },
  featuredDaysChip: { fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 },

  featuredBody: { padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  highlightRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  highlightDot: { width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0 },
  highlightText: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 },

  // Features
  features: { maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '40px' },
  featureCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px 28px' },
  featureIconWrap: { width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(196,132,92,0.1)', border: '1px solid rgba(196,132,92,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  featureIcon: { fontSize: '22px' },
  featureTitle: { fontFamily: "'Playfair Display', serif", fontSize: '19px', fontWeight: 600, marginBottom: '10px', color: 'var(--cream)' },
  featureDesc: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 },

  // Banner
  banner: { maxWidth: '1200px', margin: '0 auto 80px', padding: '0 32px' },
  bannerInner: { position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '28px', padding: '72px 48px', textAlign: 'center', overflow: 'hidden' },
  bannerGlowDot: { position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,132,92,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  bannerEyebrow: { fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' },
  bannerHeading: { fontFamily: "'Playfair Display', serif", fontSize: '40px', fontWeight: 700, color: 'var(--cream)', marginBottom: '12px', letterSpacing: '-0.3px' },
  bannerSub: { fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '36px' },
  bannerCtas: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' },

  // Footer
  footer: { maxWidth: '1200px', margin: '0 auto', padding: '32px 32px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' },
  footerLogo: { fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: 'var(--cream)' },
  footerText: { fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic', flex: 1 },
  footerRight: { fontSize: '13px', color: 'var(--text-muted)' },
}
