import { HeroSection } from '@/components/homepage/HeroSection'
import { SocialProofBar } from '@/components/homepage/SocialProofBar'
import { DemoSection } from '@/components/homepage/DemoSection'
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection'
import { PricingSection } from '@/components/homepage/PricingSection'
import { TestimonialSection } from '@/components/homepage/TestimonialSection'
import { Footer } from '@/components/homepage/Footer'

const FALLBACK_COUNT = 1247

async function getStoryCount(): Promise<number> {
  try {
    // Fetch from the story count API at render time
    // Use absolute URL with the app base URL (required for server-side fetch in Next.js)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const res = await fetch(`${baseUrl}/api/story/count`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60s
    })

    if (!res.ok) return FALLBACK_COUNT

    const data = await res.json()
    return typeof data.count === 'number' ? data.count : FALLBACK_COUNT
  } catch {
    return FALLBACK_COUNT
  }
}

export default async function HomePage() {
  const count = await getStoryCount()

  return (
    <main style={{ background: '#0D1B2A', minHeight: '100vh' }}>
      <HeroSection />
      <SocialProofBar count={count} />
      <DemoSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialSection />
      <Footer />
    </main>
  )
}
