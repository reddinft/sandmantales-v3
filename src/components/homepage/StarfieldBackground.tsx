// Server component — generates static star elements with CSS animation
// No JS at runtime; purely decorative

interface Star {
  id: number
  top: number
  left: number
  size: number
  duration: number
  delay: number
}

// Deterministic "random" using a simple hash so SSR and client match
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: seededRand(i * 3 + 1) * 100,
    left: seededRand(i * 3 + 2) * 100,
    size: seededRand(i * 3 + 3) < 0.3 ? 3 : seededRand(i * 3 + 3) < 0.7 ? 2 : 1.5,
    duration: 2 + seededRand(i * 7 + 4) * 3,
    delay: seededRand(i * 7 + 5) * 4,
  }))
}

const STARS = generateStars(50)

export function StarfieldBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(245,197,66,0.06) 0%, transparent 70%)',
      }}
    >
      {STARS.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-star-shimmer"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            // Use CSS custom properties for animation params
            ['--twinkle-duration' as string]: `${star.duration}s`,
            ['--twinkle-delay' as string]: `${star.delay}s`,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
