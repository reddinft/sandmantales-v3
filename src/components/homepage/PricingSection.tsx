// Pricing confirmed:
// - Monthly: $9.99/mo
// - Lifetime: $49 launch price (first 100 customers)
// - Free: 3 stories, no credit card
//
// NOTE: The spec (homepage-copy.md) shows $7.99 monthly and $79 lifetime,
// but the confirmed Phase 3 pricing from Loki is $9.99/mo and $49 lifetime.
// Using confirmed pricing here.

import Link from 'next/link'

const MONTHLY_FEATURES = [
  'Unlimited personalised stories',
  '6 narration voices to choose from',
  'AI-generated illustrations',
  'Story history & replay',
  'Mobile + web access',
]

const LIFETIME_FEATURES = [
  'Everything in Monthly',
  'All future voices & illustration styles',
  'Priority story generation',
  'Family sharing — up to 4 children',
  'Offline story download',
]

function CheckIcon() {
  return (
    <span
      className="flex-shrink-0 text-sm font-bold"
      style={{ color: '#F5C542' }}
      aria-hidden="true"
    >
      ✓
    </span>
  )
}

export function PricingSection() {
  return (
    <section
      className="py-16 md:py-24 px-4 md:px-8"
      style={{ background: '#162032' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 600,
              color: '#F4EFE6',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Simple, honest pricing
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '1.125rem',
              color: '#B8B0C8',
            }}
          >
            Start free. Pay only when you&apos;re ready to make every bedtime magical.
          </p>
        </div>

        {/* Cards — mobile: lifetime first (most compelling), desktop: side-by-side */}
        <div className="flex flex-col-reverse md:flex-row items-center md:items-stretch justify-center gap-6">

          {/* Monthly Card */}
          <div
            className="w-full max-w-sm md:max-w-none md:w-80 flex flex-col"
            style={{
              background: '#162032',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '32px',
            }}
          >
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-widest"
              style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}
            >
              Monthly
            </p>
            <div className="flex items-end gap-1 mb-1">
              <span
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: '#F4EFE6',
                  lineHeight: 1,
                }}
              >
                $9.99
              </span>
              <span
                className="mb-2"
                style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}
              >
                / month
              </span>
            </div>
            <p
              className="mb-6 text-xs"
              style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}
            >
              Billed monthly · Cancel anytime
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {MONTHLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon />
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '0.9375rem',
                      color: '#F4EFE6',
                      lineHeight: 1.5,
                    }}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/create"
              className="block text-center font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              style={{
                background: '#F5A623',
                color: '#0D1B2A',
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '1rem',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 20px rgba(245, 166, 35, 0.35)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Start Free Trial
            </Link>
          </div>

          {/* Lifetime Card */}
          <div
            className="w-full max-w-sm md:max-w-none md:w-80 flex flex-col relative"
            style={{
              background: '#1A2E45',
              border: '2px solid rgba(245,197,66,0.4)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 0 40px rgba(245,197,66,0.08)',
              transform: 'scale(1.03)',
              transformOrigin: 'center',
            }}
          >
            {/* Best Value badge */}
            <div
              className="absolute font-semibold"
              style={{
                top: '-14px',
                right: '20px',
                background: '#F5C542',
                color: '#0D1B2A',
                borderRadius: '20px',
                padding: '4px 14px',
                fontSize: '12px',
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
              }}
            >
              ⭐ Best Value
            </div>

            <p
              className="mb-2 text-sm font-semibold uppercase tracking-widest"
              style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}
            >
              Lifetime Access
            </p>
            <div className="flex items-end gap-1 mb-1">
              <span
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: '#F5C542',
                  lineHeight: 1,
                }}
              >
                $49
              </span>
              <span
                className="mb-2"
                style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}
              >
                one-time
              </span>
            </div>
            <p
              className="mb-1 text-xs"
              style={{ color: '#F5C542', fontFamily: 'var(--font-inter)', fontWeight: 500 }}
            >
              🚀 Launch price — first 100 customers
            </p>
            <p
              className="mb-6 text-xs"
              style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}
            >
              Save vs monthly subscription forever
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {LIFETIME_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon />
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '0.9375rem',
                      color: '#F4EFE6',
                      lineHeight: 1.5,
                    }}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            {/* Stub URL — Nissan to wire up Stripe checkout for lifetime plan */}
            <Link
              href="/api/stripe/checkout?plan=lifetime"
              className="block text-center font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              style={{
                background: '#F5A623',
                color: '#0D1B2A',
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '1rem',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 20px rgba(245, 166, 35, 0.5)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Get Lifetime Access
            </Link>
          </div>

        </div>

        {/* Free trial note */}
        <p
          className="text-center mt-10"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '1rem',
            color: '#B8B0C8',
          }}
        >
          🎁 Start with 3 free stories — no credit card required
        </p>

      </div>
    </section>
  )
}
