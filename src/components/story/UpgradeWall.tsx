'use client'

import { useState } from 'react'
import { SignInModal } from '@/components/auth/SignInModal'

interface UpgradeWallProps {
  childName: string
  onDismiss: () => void
  onSignUp?: () => void
}

export function UpgradeWall({ childName, onDismiss, onSignUp }: UpgradeWallProps) {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'lifetime' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSignIn, setShowSignIn] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<'monthly' | 'lifetime' | null>(null)

  const startCheckout = async (plan: 'monthly' | 'lifetime') => {
    setError(null)
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (res.status === 401) {
        // Not logged in — open SignInModal, then resume checkout after sign-in
        setPendingPlan(plan)
        setShowSignIn(true)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      const { checkoutUrl } = await res.json()
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch {
      setError('Connection error — please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleSignInSuccess = async () => {
    setShowSignIn(false)
    if (pendingPlan) {
      const plan = pendingPlan
      setPendingPlan(null)
      await startCheckout(plan)
    }
  }

  const handleMonthly = () => startCheckout('monthly')
  const handleLifetime = () => startCheckout('lifetime')

  const isLoading = loadingPlan !== null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(13,27,42,0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px',
        }}
      >
        <div
          style={{
            background: '#162032',
            border: '1px solid rgba(245,197,66,0.2)',
            borderRadius: '20px',
            padding: '36px 28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌙</div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.6rem',
              fontWeight: 600,
              color: '#F4EFE6',
              lineHeight: 1.3,
              marginBottom: '10px',
            }}
          >
            You&apos;ve used your 3 free stories 🌙
          </h2>

          {/* Sub */}
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '1rem',
              color: '#B8B0C8',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}
          >
            Unlock unlimited bedtime magic for{' '}
            <strong style={{ color: '#F4EFE6' }}>{childName || 'your child'}</strong>{' '}
            and every child in your family
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#FCA5A5',
                fontSize: '0.85rem',
                marginBottom: '16px',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {error}
            </div>
          )}

          {/* Plans */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {/* Monthly */}
            <button
              onClick={handleMonthly}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1.5px solid rgba(245,197,66,0.25)',
                background: 'rgba(255,255,255,0.04)',
                color: '#F4EFE6',
                fontFamily: 'var(--font-inter)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading && loadingPlan !== 'monthly' ? 0.5 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.borderColor = 'rgba(245,197,66,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,197,66,0.25)')}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>Monthly</div>
                <div style={{ fontSize: '0.8rem', color: '#B8B0C8', marginTop: '2px' }}>Unlimited stories, cancel anytime</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#F5C542' }}>
                {loadingPlan === 'monthly' ? '…' : '$9.99/mo'}
              </div>
            </button>

            {/* Lifetime */}
            <button
              onClick={handleLifetime}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #F5C542',
                background: 'rgba(245,197,66,0.08)',
                color: '#F4EFE6',
                fontFamily: 'var(--font-inter)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading && loadingPlan !== 'lifetime' ? 0.5 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
              }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.background = 'rgba(245,197,66,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,197,66,0.08)')}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>Lifetime Access</div>
                <div style={{ fontSize: '0.8rem', color: '#B8B0C8', marginTop: '2px' }}>Pay once, stories forever</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span
                  style={{
                    background: '#F5C542',
                    color: '#0D1B2A',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    letterSpacing: '0.04em',
                  }}
                >
                  ⭐ BEST VALUE
                </span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#F5C542' }}>
                  {loadingPlan === 'lifetime' ? '…' : '$49'}
                </span>
              </div>
            </button>
          </div>

          {/* Sign up nudge */}
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.875rem',
              color: '#B8B0C8',
              marginBottom: '16px',
            }}
          >
            Or{' '}
            <button
              onClick={onSignUp}
              style={{
                background: 'none',
                border: 'none',
                color: '#F5C542',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              create a free account to save your stories
            </button>
          </p>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#B8B0C8',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              opacity: 0.7,
            }}
          >
            Maybe later
          </button>
        </div>
      </div>

      {/* SignInModal — shown when unauthenticated user tries to checkout */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => {
          setShowSignIn(false)
          setPendingPlan(null)
        }}
        onSuccess={handleSignInSuccess}
        initialTab="signup"
      />
    </>
  )
}
