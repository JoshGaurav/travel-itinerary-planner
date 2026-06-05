import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Input } from '../components/Input'
import { Button } from '../components/Button'

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })
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
        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.subheading}>Start planning your trips with Itinera</p>

        <form onSubmit={handleSignup} style={styles.form}>
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
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Create account
          </Button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
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
