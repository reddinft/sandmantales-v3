import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'
import { ShareStoryButton } from './ShareStoryButton'
import Image from 'next/image'

interface Story {
  id: string
  child_name: string
  child_age: number
  story_text: string
  audio_url: string | null
  image_url: string | null
  is_public: boolean
  user_id: string | null
}

interface StoryPageProps {
  params: Promise<{ id: string }>
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function fetchStory(id: string): Promise<Story | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('stories')
    .select('id, child_name, child_age, story_text, audio_url, image_url, is_public, user_id')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Story
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { id } = await params
  const story = await fetchStory(id)

  if (!story || !story.is_public) {
    return {
      title: 'Bedtime Story | SandmanTales',
      description: 'A personalised bedtime story created with SandmanTales.',
    }
  }

  const title = `${story.child_name}'s Bedtime Story | SandmanTales`
  const description = story.story_text.slice(0, 160).replace(/\n/g, ' ')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sandmantales.com'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'SandmanTales',
      images: [
        {
          url: `${appUrl}/api/og?storyId=${id}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${appUrl}/api/og?storyId=${id}`],
    },
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params
  const story = await fetchStory(id)

  if (!story) notFound()

  const user = await getUser()
  const isOwner = !!user && user.id === story.user_id
  const canViewFull = story.is_public || isOwner

  const storyTitle = `${story.child_name}'s Bedtime Story`

  return (
    <main
      style={{
        background: '#0D1B2A',
        minHeight: '100vh',
        padding: '40px 20px',
        fontFamily: 'var(--font-inter)',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <a
            href="/"
            style={{
              color: '#F5C542',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '24px',
            }}
          >
            🌙 SandmanTales
          </a>
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              fontWeight: 700,
              color: '#F4EFE6',
              lineHeight: 1.25,
              marginBottom: '8px',
            }}
          >
            {storyTitle}
          </h1>
          <p style={{ color: '#B8B0C8', fontSize: '0.9rem' }}>
            A personalised story created with SandmanTales
          </p>
        </div>

        {/* Story card */}
        <div
          style={{
            borderRadius: '20px',
            border: '1px solid rgba(245,197,66,0.15)',
            background: '#162032',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          {/* Illustration */}
          {story.image_url ? (
            <div style={{ position: 'relative', width: '100%', height: '320px' }}>
              <Image
                src={story.image_url}
                alt={`Illustration for ${story.child_name}'s story`}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          ) : (
            <div
              style={{
                height: '180px',
                background: 'linear-gradient(135deg, #1A2E45 0%, #162032 50%, #0F1E30 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: '64px' }}>🌙</div>
            </div>
          )}

          <div style={{ padding: '32px' }}>
            {canViewFull ? (
              <>
                {/* Full story text — SSR rendered for SEO */}
                <div
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.05rem',
                    color: '#F4EFE6',
                    lineHeight: 1.85,
                    whiteSpace: 'pre-line',
                    marginBottom: '24px',
                  }}
                >
                  {story.story_text}
                </div>

                {/* Audio player */}
                {story.audio_url && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '24px',
                    }}
                  >
                    <p
                      style={{
                        color: '#B8B0C8',
                        fontSize: '0.75rem',
                        marginBottom: '10px',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      🎙 Narrated just for {story.child_name}
                    </p>
                    {/* Native audio — works without JS for SSR accessibility */}
                    <audio
                      controls
                      src={story.audio_url}
                      style={{ width: '100%', accentColor: '#F5C542' }}
                      preload="metadata"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </>
            ) : (
              /* Teaser for private stories */
              <div
                style={{
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.05rem',
                    color: '#F4EFE6',
                    lineHeight: 1.85,
                    marginBottom: '16px',
                  }}
                >
                  {story.story_text.slice(0, 280).replace(/\n/g, ' ')}…
                </div>
                <div
                  style={{
                    background: 'rgba(245,197,66,0.06)',
                    border: '1px solid rgba(245,197,66,0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      color: '#F4EFE6',
                      fontFamily: 'var(--font-playfair)',
                      fontSize: '1rem',
                      marginBottom: '12px',
                    }}
                  >
                    🔒 This story is private
                  </p>
                  <p style={{ color: '#B8B0C8', fontSize: '0.875rem', marginBottom: '0' }}>
                    Sign in or ask the creator to share this story publicly.
                  </p>
                </div>
              </div>
            )}

            {/* Share button (owner only) */}
            {isOwner && !story.is_public && (
              <div style={{ marginBottom: '20px' }}>
                <ShareStoryButton storyId={story.id} />
              </div>
            )}

            {/* CTA */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(245,197,66,0.06) 100%)',
                border: '1px solid rgba(245,197,66,0.2)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '1.15rem',
                  color: '#F4EFE6',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                ✨ Create a story for YOUR child
              </p>
              <p style={{ color: '#B8B0C8', fontSize: '0.875rem', marginBottom: '16px' }}>
                AI-powered, voice-narrated, illustrated — personalised just for them.
              </p>
              <a
                href="/create"
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #F5A623 0%, #F5C542 100%)',
                  color: '#0D1B2A',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                Start Free — No Card Needed →
              </a>
              <p style={{ color: '#6B7A8D', fontSize: '0.75rem', marginTop: '10px' }}>
                sandmantales.com · 3 free stories to start
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
