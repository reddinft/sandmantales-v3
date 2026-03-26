import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0D1B2A',
          color: '#F4EFE6',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Moon emoji */}
        <div style={{ fontSize: 80, marginBottom: 32, display: 'flex' }}>🌙</div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 'bold',
            color: '#F4EFE6',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 24,
            display: 'flex',
          }}
        >
          SandmanTales
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#F5C542',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Bedtime stories with your child as the hero
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            color: '#B8B0C8',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Voice-narrated · Illustrated · Personalised · Free to start
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
