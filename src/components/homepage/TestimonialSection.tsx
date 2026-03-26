const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Sarah M.',
    location: 'Melbourne, Australia',
    initials: 'SM',
    quote:
      '"My daughter Lily screamed with excitement when she heard her own name in the story. She made me play it three times before she\'d go to sleep. Now it\'s the only way she\'ll do bedtime."',
    rating: 5,
  },
  {
    id: 't2',
    name: 'James R.',
    location: 'Toronto, Canada',
    initials: 'JR',
    quote:
      '"I was sceptical — just another app, right? But when my son Oliver heard \u2018Oliver the Brave\u2019 go on an adventure to his actual school, he started crying happy tears. I might have too."',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Priya K.',
    location: 'London, UK',
    initials: 'PK',
    quote:
      '"We\u2019ve tried every bedtime trick in the book. SandmanTales is the first thing that actually works. My twins fight over whose night it is to get their story. That\u2019s basically a miracle."',
    rating: 5,
  },
]

export function TestimonialSection() {
  return (
    <section
      className="py-16 md:py-24 px-4 md:px-8"
      style={{ background: '#0D1B2A' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 600,
              color: '#F4EFE6',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Parents (and their kids) are obsessed
          </h2>
        </div>

        {/* Grid — 3-col desktop, 1-col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="flex flex-col"
              style={{
                background: '#162032',
                borderRadius: '16px',
                padding: '24px',
                borderLeft: '4px solid #F5C542',
              }}
            >
              {/* Stars */}
              <div
                className="mb-4 text-base"
                style={{ color: '#F5C542' }}
                aria-label={`${t.rating} stars`}
              >
                {'★'.repeat(t.rating)}
              </div>

              {/* Quote */}
              <blockquote
                className="flex-1 mb-5 italic"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '1rem',
                  color: '#F4EFE6',
                  lineHeight: 1.65,
                }}
              >
                {t.quote}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(245,197,66,0.2)',
                    color: '#F5C542',
                    fontSize: '13px',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 600,
                  }}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: '#F4EFE6', fontFamily: 'var(--font-inter)' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}
                  >
                    {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
