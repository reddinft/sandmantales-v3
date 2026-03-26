import Link from 'next/link'

export function Footer() {
  return (
    <footer
      style={{
        background: '#0A1520',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 24px',
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Top row — tagline + links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          {/* Tagline */}
          <p
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#F4EFE6',
            }}
          >
            SandmanTales — for parents of children aged 3–8
          </p>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '0.875rem',
                      color: '#B8B0C8',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }} />

        {/* Copyright */}
        <p
          className="text-center text-sm"
          style={{
            fontFamily: 'var(--font-inter)',
            color: '#B8B0C8',
          }}
        >
          © 2026 SandmanTales. Made with ♥ for tired parents everywhere.
        </p>

      </div>
    </footer>
  )
}
