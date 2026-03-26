const STEPS = [
  {
    number: '01',
    emoji: '📝',
    title: 'Tell us about your child',
    body: 'Enter their name, age, and a little about their day — it takes about 30 seconds.',
  },
  {
    number: '02',
    emoji: '✨',
    title: 'We craft their story',
    body: 'Our AI writes a unique, personalised bedtime story with your child as the hero — every single night.',
  },
  {
    number: '03',
    emoji: '🌙',
    title: 'Listen together at bedtime',
    body: 'Stream their narrated story with illustrations. A calming ritual they\'ll ask for every night.',
  },
]

export function HowItWorksSection() {
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
            Three steps to bedtime magic
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px"
            style={{
              background: 'repeating-linear-gradient(to right, rgba(245,197,66,0.3) 0, rgba(245,197,66,0.3) 8px, transparent 8px, transparent 16px)',
            }}
            aria-hidden="true"
          />

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              {/* Step number */}
              <p
                className="mb-3 tracking-widest font-medium"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.75rem',
                  color: '#B8B0C8',
                }}
              >
                {step.number}
              </p>

              {/* Icon circle */}
              <div
                className="mb-5 flex items-center justify-center"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(245,197,66,0.12)',
                  fontSize: '28px',
                  border: '1px solid rgba(245,197,66,0.2)',
                  position: 'relative',
                  zIndex: 1,
                  backgroundColor: '#0D1B2A',
                }}
              >
                <span>{step.emoji}</span>
              </div>

              {/* Title */}
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#F4EFE6',
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>

              {/* Body */}
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '1rem',
                  color: '#B8B0C8',
                  lineHeight: 1.65,
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
