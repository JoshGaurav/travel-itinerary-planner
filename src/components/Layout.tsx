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
              Dashboard
            </NavLink>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}>
              Log in
            </NavLink>
            <NavLink to="/signup" style={styles.signupBtn}>
              Sign up
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
    height: '64px',
    background: 'rgba(10, 10, 15, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-primary)',
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
    transition: 'color 0.2s',
  },
  activeLink: {
    color: 'var(--text-primary)',
  },
  signupBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.2s',
  },
  logoutBtn: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}
