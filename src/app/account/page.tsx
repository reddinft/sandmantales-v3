/**
 * /account — User account page (Server Component, protected)
 *
 * Middleware redirects unauthenticated users to /?signin=true before this renders.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { getUserTier } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import SignOutButton from './SignOutButton'

const FREE_LIMIT = 3

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getPeriodStart(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

interface Story {
  id: string
  child_name: string
  prompt: string
  created_at: string
  image_url: string | null
}

export default async function AccountPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Should never reach here due to middleware, but guard just in case
  if (!user) {
    redirect('/?signin=true')
  }

  const service = getServiceClient()
  const periodStart = getPeriodStart()

  // Fetch tier, stories, and usage in parallel
  const [tier, storiesResult, usageResult] = await Promise.all([
    getUserTier(user.id),

    service
      .from('stories')
      .select('id, child_name, prompt, created_at, image_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),

    service
      .from('usage_counts')
      .select('story_count')
      .eq('user_id', user.id)
      .eq('period_start', periodStart)
      .single(),
  ])

  const stories: Story[] = (storiesResult.data ?? []) as Story[]
  const usageCount = usageResult.data?.story_count ?? 0

  const tierLabel =
    tier === 'lifetime'
      ? 'Lifetime ⭐'
      : tier === 'monthly'
      ? 'Monthly'
      : 'Free'

  const tierColor =
    tier === 'lifetime'
      ? { background: 'rgba(245,197,66,0.15)', color: '#F5C542', border: '1px solid rgba(245,197,66,0.4)' }
      : tier === 'monthly'
      ? { background: 'rgba(99,179,237,0.1)', color: '#63B3ED', border: '1px solid rgba(99,179,237,0.3)' }
      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }

  const isFree = tier === 'free'
  const progressPct = isFree ? Math.min((usageCount / FREE_LIMIT) * 100, 100) : 0

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0D1B2A',
        color: '#fff',
        fontFamily: 'var(--font-inter)',
        padding: '32px 16px',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '2rem',
              color: '#F5C542',
              margin: 0,
            }}
          >
            Your Stories
          </h1>
          <span
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              ...tierColor,
            }}
          >
            {tierLabel}
          </span>
        </div>

        {/* ── Usage section ── */}
        <section
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '24px',
          }}
        >
          <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
            <strong>{usageCount}</strong>{' '}
            {tier === 'monthly' || tier === 'lifetime'
              ? 'stories created this month'
              : `of ${FREE_LIMIT} free stories used`}
          </p>

          {isFree && (
            <>
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background:
                      progressPct >= 100
                        ? '#EF4444'
                        : progressPct >= 66
                        ? '#F5A623'
                        : '#F5C542',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              {usageCount >= FREE_LIMIT ? (
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#FCA5A5' }}>
                  You&apos;ve used all free stories.{' '}
                  <Link href="/pricing" style={{ color: '#F5C542', textDecoration: 'underline' }}>
                    Upgrade to keep creating →
                  </Link>
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  {FREE_LIMIT - usageCount} free {FREE_LIMIT - usageCount === 1 ? 'story' : 'stories'} remaining
                </p>
              )}
            </>
          )}
        </section>

        {/* ── Story history ── */}
        <section style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}
          >
            Recent Stories
          </h2>

          {stories.length === 0 ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem',
              }}
            >
              No stories yet.{' '}
              <Link href="/create" style={{ color: '#F5C542', textDecoration: 'underline' }}>
                Create your first one →
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stories.map(story => (
                <li key={story.id}>
                  <Link
                    href={`/story/${story.id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,197,66,0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                    >
                      {story.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={story.image_url}
                          alt={`Story for ${story.child_name}`}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '8px',
                            background: 'rgba(245,197,66,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0,
                          }}
                        >
                          🌙
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: '0 0 4px',
                            color: '#F5C542',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                          }}
                        >
                          {story.child_name}&apos;s story
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.82rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {story.prompt}
                        </p>
                      </div>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255,255,255,0.3)',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Account section ── */}
        <section
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px 24px',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Account
          </h2>

          <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: '8px' }}>Email</span>
            {user.email}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href="/api/stripe/portal"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(245,197,66,0.3)',
                color: '#F5C542',
                fontSize: '0.85rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Manage subscription
            </Link>

            <SignOutButton />
          </div>
        </section>

      </div>
    </main>
  )
}
