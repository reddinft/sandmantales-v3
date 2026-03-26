import Link from 'next/link'
import { StarfieldBackground } from './StarfieldBackground'
import { HeroNameCycler } from './HeroNameCycler'

const CYCLE_NAMES = ['Emma', 'Lucas', 'Aisha', 'Noah', 'Chloe', 'Mia', 'Oliver']
const CYCLE_DURATION_MS = 2500

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: '#0D1B2A' }}
    >
      <StarfieldBackground />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:grid lg:grid-cols-[55fr_45fr] lg:gap-16 items-center">

          {/* Left column — copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Eyebrow */}
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                background: 'rgba(245,197,66,0.12)',
                color: '#F5C542',
                border: '1px solid rgba(245,197,66,0.25)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              AI-powered bedtime stories
            </span>

            {/* H1 */}
            <h1
              className="mb-5 leading-tight"
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: '#F4EFE6',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Tonight,{' '}
              {/* SSR renders "Emma"; client hydrates and cycles */}
              <HeroNameCycler names={CYCLE_NAMES} durationMs={CYCLE_DURATION_MS} />
              {' '}is the hero of the story.
            </h1>

            {/* Sub-headline */}
            <p
              className="mb-8 max-w-xl"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                color: '#B8B0C8',
                lineHeight: 1.65,
              }}
            >
              SandmanTales creates personalised bedtime stories with your child&apos;s name,
              voice-narrated and beautifully illustrated — in under 30 seconds.
            </p>

            {/* Primary CTA */}
            <Link
              href="/create"
              className="inline-block mb-4 w-full sm:w-auto text-center font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              style={{
                background: '#F5A623',
                color: '#0D1B2A',
                borderRadius: '12px',
                padding: '16px 28px',
                fontSize: '1rem',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 20px rgba(245, 166, 35, 0.35)',
                maxWidth: '340px',
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
              }}
            >
              Create Your First Story Free →
            </Link>

            {/* Trust micro-copy */}
            <p
              className="text-sm"
              style={{
                color: '#B8B0C8',
                fontFamily: 'var(--font-inter)',
              }}
            >
              No credit card required · 3 free stories included · Takes 30 seconds
            </p>
          </div>

          {/* Right column — hero illustration placeholder */}
          <div className="mt-12 lg:mt-0 flex justify-center lg:justify-end">
            <div
              className="animate-float rounded-2xl flex items-center justify-center"
              style={{
                width: 'clamp(280px, 40vw, 420px)',
                height: 'clamp(280px, 40vw, 420px)',
                background: 'linear-gradient(135deg, #1A2E45 0%, #162032 40%, #0D1B2A 100%)',
                border: '1px solid rgba(245,197,66,0.15)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              }}
              aria-label="Hero illustration — child reading on a glowing crescent moon"
            >
              {/* Illustration placeholder — replace with hero-child-on-moon.png once generated */}
              {/* Prompt: "A child sitting on a glowing crescent moon reading a book, warm watercolour illustration, deep navy night sky, golden light, stars, children's book style, no text" */}
              <div className="text-center px-8">
                <div style={{ fontSize: '80px', lineHeight: 1 }}>🌙</div>
                <div
                  className="mt-4 text-sm"
                  style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}
                >
                  Illustration coming soon
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
