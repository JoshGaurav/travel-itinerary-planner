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
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontFamily: 'inherit',
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
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
    color: '#fff',
  },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '13px' },
  md: { padding: '10px 24px', fontSize: '14px' },
  lg: { padding: '14px 32px', fontSize: '16px' },
}

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
}
