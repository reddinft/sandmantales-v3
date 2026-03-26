import Link from 'next/link'

export default function NotFound() {
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
      {/* Moon */}
      <div style={{ fontSize: '80px', marginBottom: '24px' }}>🌙</div>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#F4EFE6',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}
      >
        Lost in Dreamland
      </h1>

      {/* Subtitle */}
      <p
        style={{
          color: '#B8B0C8',
          fontSize: '1rem',
          maxWidth: '400px',
          lineHeight: 1.6,
          marginBottom: '36px',
        }}
      >
        The page you&apos;re looking for has drifted off into the stars. Let&apos;s find your way back.
      </p>

      {/* CTA */}
      <Link
        href="/create"
        style={{
          display: 'inline-block',
          padding: '14px 32px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #F5A623 0%, #F5C542 100%)',
          color: '#0D1B2A',
          fontFamily: 'var(--font-inter)',
          fontWeight: 700,
          fontSize: '1rem',
          textDecoration: 'none',
          marginBottom: '16px',
        }}
      >
        ✨ Create a Bedtime Story
      </Link>

      <Link
        href="/"
        style={{
          color: '#F5C542',
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}
      >
        ← Back to SandmanTales
      </Link>

      {/* Stars decoration */}
      <div
        style={{
          marginTop: '60px',
          color: '#2A3F58',
          fontSize: '1.5rem',
          letterSpacing: '12px',
        }}
      >
        ★ ★ ★ ★ ★
      </div>
    </main>
  )
}
