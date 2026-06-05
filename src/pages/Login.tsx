import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Input } from '../components/Input'
import { Button } from '../components/Button'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to continue planning your adventures</p>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Sign in
          </Button>
        </form>

        <p style={styles.footer}>
          New to Itinera? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 68px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '44px',
    width: '100%',
    maxWidth: '440px',
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '30px',
    fontWeight: 700,
    marginBottom: '8px',
    letterSpacing: '-0.3px',
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
  error: {
    background: 'rgba(196, 107, 107, 0.12)',
    color: 'var(--error)',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
}
