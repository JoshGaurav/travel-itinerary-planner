import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <NavLink to="/" style={styles.logo}>
        Itinera
      </NavLink>
      <div style={styles.links}>
        {user ? (
          <>
            <NavLink to="/dashboard" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}>
              My Trips
            </NavLink>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}>
              Sign in
            </NavLink>
            <NavLink to="/signup" style={styles.signupBtn}>
              Get started
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '68px',
    background: 'rgba(26, 23, 20, 0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--cream)',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  link: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.25s',
  },
  activeLink: {
    color: 'var(--cream)',
  },
  signupBtn: {
    background: 'var(--accent)',
    color: 'var(--warm-white)',
    border: 'none',
    borderRadius: '12px',
    padding: '9px 22px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.25s',
    boxShadow: '0 2px 8px rgba(196, 132, 92, 0.25)',
  },
  logoutBtn: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '9px 22px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
}
