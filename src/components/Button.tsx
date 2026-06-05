import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, children, style, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...(disabled || loading ? disabledStyles : {}),
        ...style,
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

const baseStyles: React.CSSProperties = {
  border: 'none',
  borderRadius: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.25s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontFamily: 'inherit',
  letterSpacing: '0.01em',
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--warm-white)',
    boxShadow: '0 2px 8px rgba(196, 132, 92, 0.25)',
  },
  secondary: {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
  },
  danger: {
    background: 'var(--error)',
    color: 'var(--warm-white)',
  },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: '13px' },
  md: { padding: '11px 28px', fontSize: '14px' },
  lg: { padding: '15px 36px', fontSize: '16px' },
}

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  boxShadow: 'none',
}
