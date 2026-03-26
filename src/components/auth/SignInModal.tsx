'use client'

import { useState, useEffect, useCallback } from 'react'
import { signIn, signUp, signInWithMagicLink } from '@/lib/auth-client'

export type AuthTab = 'signin' | 'signup'

export interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialTab?: AuthTab
}

export function SignInModal({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'signin',
}: SignInModalProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkMode, setMagicLinkMode] = useState(false)

  // Sync tab when prop changes
  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setError(null)
      setLoading(false)
      setMagicLinkSent(false)
      setMagicLinkMode(false)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const getGuestSessionId = (): string | undefined => {
    if (typeof document === 'undefined') return undefined
    const match = document.cookie.match(/(?:^|;\s*)smt_guest_id=([^;]+)/)
    return match?.[1]
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setLoading(true)

      try {
        if (magicLinkMode) {
          const { error } = await signInWithMagicLink(email)
          if (error) {
            setError(error.message)
          } else {
            setMagicLinkSent(true)
          }
          return
        }

        if (tab === 'signup') {
          const guestSessionId = getGuestSessionId()

          // Call API route for signup so migration runs server-side
          const res = await fetch('/api/auth?action=signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, guestSessionId }),
          })
          const data = await res.json()

          if (!res.ok) {
            setError(data.error ?? 'Sign-up failed')
            return
          }

          // Clear guest cookie after migration
          document.cookie = 'smt_guest_id=; Max-Age=0; path=/'

          // Sign in locally so the browser session is established
          const { error: signInError } = await signIn(email, password)
          if (signInError) {
            // Account created but auto-login failed — just close
            console.warn('Auto sign-in after signup failed:', signInError.message)
          }
        } else {
          const { error } = await signIn(email, password)
          if (error) {
            setError(error.message)
            return
          }
        }

        onSuccess?.()
        onClose()
      } finally {
        setLoading(false)
      }
    },
    [tab, email, password, magicLinkMode, onSuccess, onClose]
  )

  if (!isOpen) return null

  const styles = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    },
    modal: {
      background: '#0D1B2A',
      border: '1px solid rgba(245,197,66,0.2)',
      borderRadius: '16px',
      padding: '32px',
      width: '100%',
      maxWidth: '420px',
      position: 'relative' as const,
    },
    closeBtn: {
      position: 'absolute' as const,
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      color: 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      fontSize: '20px',
      lineHeight: 1,
      padding: '4px 8px',
    },
    tabs: {
      display: 'flex',
      gap: '0',
      marginBottom: '24px',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid rgba(245,197,66,0.2)',
    },
    tab: (active: boolean) => ({
      flex: 1,
      padding: '10px 16px',
      background: active ? 'rgba(245,197,66,0.15)' : 'transparent',
      border: 'none',
      color: active ? '#F5C542' : 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: active ? 600 : 400,
      transition: 'all 0.2s',
      fontFamily: 'var(--font-inter)',
    }),
    input: {
      width: '100%',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#fff',
      fontSize: '0.95rem',
      outline: 'none',
      boxSizing: 'border-box' as const,
      fontFamily: 'var(--font-inter)',
    },
    label: {
      display: 'block',
      fontSize: '0.8rem',
      color: 'rgba(255,255,255,0.6)',
      marginBottom: '6px',
      fontFamily: 'var(--font-inter)',
    },
    fieldGroup: {
      marginBottom: '16px',
    },
    primaryBtn: {
      width: '100%',
      background: 'linear-gradient(135deg, #F5C542, #E8A020)',
      border: 'none',
      borderRadius: '8px',
      padding: '12px',
      color: '#0D1B2A',
      fontWeight: 700,
      fontSize: '0.95rem',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      fontFamily: 'var(--font-inter)',
      transition: 'opacity 0.2s',
    },
    error: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#FCA5A5',
      fontSize: '0.85rem',
      marginBottom: '16px',
      fontFamily: 'var(--font-inter)',
    },
    magicLink: {
      background: 'none',
      border: 'none',
      color: 'rgba(245,197,66,0.8)',
      cursor: 'pointer',
      fontSize: '0.85rem',
      textDecoration: 'underline',
      padding: '0',
      marginTop: '12px',
      display: 'block',
      width: '100%',
      textAlign: 'center' as const,
      fontFamily: 'var(--font-inter)',
    },
    success: {
      textAlign: 'center' as const,
      padding: '16px 0',
    },
  }

  if (magicLinkSent) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
          <div style={styles.success}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✉️</div>
            <h2 style={{ color: '#F5C542', fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', marginBottom: '8px' }}>
              Check your inbox
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontFamily: 'var(--font-inter)' }}>
              We sent a magic link to <strong>{email}</strong>. Click it to sign in instantly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        <h2
          style={{
            color: '#F5C542',
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          {magicLinkMode
            ? 'Magic Link Sign In'
            : tab === 'signin'
            ? 'Welcome Back'
            : 'Create Account'}
        </h2>

        {!magicLinkMode && (
          <div style={styles.tabs}>
            <button style={styles.tab(tab === 'signin')} onClick={() => { setTab('signin'); setError(null) }}>
              Sign In
            </button>
            <button style={styles.tab(tab === 'signup')} onClick={() => { setTab('signup'); setError(null) }}>
              Create Account
            </button>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          {!magicLinkMode && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          <button type="submit" style={styles.primaryBtn} disabled={loading}>
            {loading
              ? 'Please wait…'
              : magicLinkMode
              ? 'Send Magic Link'
              : tab === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>

          {!magicLinkMode ? (
            <button
              type="button"
              style={styles.magicLink}
              onClick={() => { setMagicLinkMode(true); setError(null) }}
            >
              Or send me a magic link
            </button>
          ) : (
            <button
              type="button"
              style={styles.magicLink}
              onClick={() => { setMagicLinkMode(false); setError(null) }}
            >
              ← Back to password sign in
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

// Convenience re-export as SignUpModal (same component, pre-seeded to signup tab)
export function SignUpModal(props: Omit<SignInModalProps, 'initialTab'>) {
  return <SignInModal {...props} initialTab="signup" />
}
