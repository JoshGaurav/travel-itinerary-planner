import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={styles.label}>{label}</label>}
      <input
        style={{ ...styles.input, ...(error ? styles.inputError : {}), ...style }}
        {...props}
      />
      {error && <span style={styles.error}>{error}</span>}
    </div>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function TextArea({ label, error, style, ...props }: TextAreaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={styles.label}>{label}</label>}
      <textarea
        style={{ ...styles.input, ...styles.textarea, ...(error ? styles.inputError : {}), ...style }}
        {...props}
      />
      {error && <span style={styles.error}>{error}</span>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  input: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  textarea: {
    minHeight: '80px',
    resize: 'vertical',
  },
  inputError: {
    borderColor: 'var(--error)',
  },
  error: {
    fontSize: '12px',
    color: 'var(--error)',
  },
}
