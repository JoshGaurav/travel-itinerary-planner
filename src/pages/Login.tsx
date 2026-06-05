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
        <p style={styles.subheading}>Log in to your Itinera account</p>

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
            Log in
          </Button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subheading: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  error: {
    background: 'rgba(248, 113, 113, 0.1)',
    color: 'var(--error)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
}
