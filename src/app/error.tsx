'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting in production
    console.error('[SandmanTales] Unhandled error:', error)
  }, [error])

  return (
    <main
      style={{
        background: '#0D1B2A',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: 'var(--font-inter)',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '72px', marginBottom: '24px' }}>😴</div>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: '#F4EFE6',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}
      >
        The Sandman Dozed Off
      </h1>

      {/* Message */}
      <p
        style={{
          color: '#B8B0C8',
          fontSize: '1rem',
          maxWidth: '420px',
          lineHeight: 1.6,
          marginBottom: '36px',
        }}
      >
        Something went wrong on our end. Don&apos;t worry — your stories are safe. Give it another try!
      </p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '12px 28px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #F5A623 0%, #F5C542 100%)',
            color: '#0D1B2A',
            fontFamily: 'var(--font-inter)',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          🔄 Try Again
        </button>

        <Link
          href="/"
          style={{
            padding: '12px 28px',
            borderRadius: '10px',
            border: '1.5px solid rgba(245,197,66,0.3)',
            background: 'transparent',
            color: '#F5C542',
            fontFamily: 'var(--font-inter)',
            fontWeight: 600,
            fontSize: '0.95rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          ← Home
        </Link>
      </div>

      {/* Error digest for support */}
      {error.digest && (
        <p style={{ color: '#3A4F68', fontSize: '0.75rem', marginTop: '32px' }}>
          Error ID: {error.digest}
        </p>
      )}
    </main>
  )
}
