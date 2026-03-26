import { getUser } from '@/lib/auth'
import { getAuthUserUsage } from '@/lib/usage'
import { StoryCreationFlow } from '@/components/story/StoryCreationFlow'

export const metadata = {
  title: 'Create a Story — SandmanTales',
  description: 'Create a personalised bedtime story for your child in seconds.',
}

export default async function CreatePage() {
  const user = await getUser()
  let userTier: string | undefined

  if (user) {
    const usage = await getAuthUserUsage(user.id)
    userTier = usage.tier
  }

  return (
    <main
      style={{ background: '#0D1B2A', minHeight: '100vh', paddingTop: '48px', paddingBottom: '64px' }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌙</div>
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
              fontWeight: 600,
              color: '#F4EFE6',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '10px',
            }}
          >
            Create Your Child&apos;s Story
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '1rem',
              color: '#B8B0C8',
              lineHeight: 1.6,
            }}
          >
            A personalised bedtime story, narrated and illustrated — just for them.
          </p>
        </div>

        {/* Story card */}
        <div
          style={{
            background: '#162032',
            borderRadius: '20px',
            border: '1px solid rgba(245,197,66,0.12)',
            padding: '28px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}
        >
          <StoryCreationFlow
            isAuthed={!!user}
            userTier={userTier}
          />
        </div>
      </div>
    </main>
  )
}
