interface SocialProofBarProps {
  count: number
}

export function SocialProofBar({ count }: SocialProofBarProps) {
  const formattedCount = count.toLocaleString('en-US')

  return (
    <div
      style={{
        background: '#162032',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 sm:divide-x sm:divide-white/10">

          {/* Stat 1 — animated story count */}
          <div className="flex flex-col items-center sm:px-10 text-center">
            <span
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#F5C542',
                lineHeight: 1.2,
              }}
            >
              {formattedCount}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.875rem',
                color: '#B8B0C8',
                marginTop: '2px',
              }}
            >
              stories created for children around the world
            </span>
          </div>

          {/* Stat 2 — star rating */}
          <div className="flex flex-col items-center sm:px-10 text-center">
            <span
              style={{
                fontSize: '1.25rem',
                color: '#F5C542',
                lineHeight: 1.2,
              }}
            >
              ★★★★★
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.875rem',
                color: '#B8B0C8',
                marginTop: '2px',
              }}
            >
              Loved by parents in 40+ countries
            </span>
          </div>

          {/* Stat 3 — average rating */}
          <div className="flex flex-col items-center sm:px-10 text-center">
            <span
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#F5C542',
                lineHeight: 1.2,
              }}
            >
              4.9/5
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.875rem',
                color: '#B8B0C8',
                marginTop: '2px',
              }}
            >
              average rating from 2,100+ reviews
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
