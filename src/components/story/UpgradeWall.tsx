'use client'

interface UpgradeWallProps {
  childName: string
  onDismiss: () => void
  onSignUp?: () => void
}

export function UpgradeWall({ childName, onDismiss, onSignUp }: UpgradeWallProps) {
  const handleMonthly = () => {
    window.location.href = '/api/stripe/checkout?plan=monthly'
  }
  const handleLifetime = () => {
    window.location.href = '/api/stripe/checkout?plan=lifetime'
  }

  return (
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
          You've used your 3 free stories 🌙
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
          Unlock unlimited bedtime magic for <strong style={{ color: '#F4EFE6' }}>{childName || 'your child'}</strong> and every child in your family
        </p>

        {/* Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {/* Monthly */}
          <button
            onClick={handleMonthly}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1.5px solid rgba(245,197,66,0.25)',
              background: 'rgba(255,255,255,0.04)',
              color: '#F4EFE6',
              fontFamily: 'var(--font-inter)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,197,66,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,197,66,0.25)')}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>Monthly</div>
              <div style={{ fontSize: '0.8rem', color: '#B8B0C8', marginTop: '2px' }}>Unlimited stories, cancel anytime</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#F5C542' }}>$9.99/mo</div>
          </button>

          {/* Lifetime */}
          <button
            onClick={handleLifetime}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #F5C542',
              background: 'rgba(245,197,66,0.08)',
              color: '#F4EFE6',
              fontFamily: 'var(--font-inter)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,197,66,0.14)')}
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
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#F5C542' }}>$49</span>
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
  )
}
