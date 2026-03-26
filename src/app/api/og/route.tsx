import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function fetchStoryForOG(storyId: string) {
  try {
    const supabase = getServiceClient()
    const { data } = await supabase
      .from('stories')
      .select('child_name, story_text, is_public')
      .eq('id', storyId)
      .single()
    return data
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storyId = searchParams.get('storyId')

  // Story-specific OG image
  if (storyId) {
    const story = await fetchStoryForOG(storyId)

    if (story && story.is_public) {
      const childName = story.child_name
      const excerpt = story.story_text
        .split('\n')
        .find((line: string) => line.trim().length > 20)
        ?.trim()
        ?.slice(0, 120) ?? story.story_text.slice(0, 120)

      return new ImageResponse(
        (
          <div
            style={{
              background: '#0D1B2A',
              color: '#F4EFE6',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '60px',
              fontFamily: 'Georgia, serif',
              position: 'relative',
            }}
          >
            {/* Moon decoration */}
            <div style={{ fontSize: 56, marginBottom: 8, display: 'flex' }}>🌙</div>

            {/* Child name headline */}
            <div
              style={{
                fontSize: 54,
                fontWeight: 'bold',
                color: '#F5C542',
                lineHeight: 1.15,
                marginBottom: 20,
                display: 'flex',
                maxWidth: '900px',
              }}
            >
              ✨ {childName}&apos;s bedtime story
            </div>

            {/* Story excerpt */}
            <div
              style={{
                fontSize: 26,
                color: '#F4EFE6',
                lineHeight: 1.5,
                maxWidth: '820px',
                opacity: 0.85,
                display: 'flex',
                flex: 1,
              }}
            >
              &ldquo;{excerpt}{excerpt.length >= 120 ? '…' : ''}&rdquo;
            </div>

            {/* Brand footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: 'auto',
                paddingTop: '20px',
                borderTop: '1px solid rgba(245,197,66,0.2)',
              }}
            >
              <div style={{ fontSize: 28, display: 'flex' }}>🌟</div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 'bold',
                  color: '#F5C542',
                  display: 'flex',
                }}
              >
                SandmanTales
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: '#B8B0C8',
                  marginLeft: '8px',
                  display: 'flex',
                }}
              >
                sandmantales.com
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      )
    }
  }

  // Default homepage OG image
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0D1B2A',
          color: '#F4EFE6',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Moon emoji */}
        <div style={{ fontSize: 80, marginBottom: 32, display: 'flex' }}>🌙</div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 'bold',
            color: '#F4EFE6',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 24,
            display: 'flex',
          }}
        >
          SandmanTales
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#F5C542',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Bedtime stories with your child as the hero
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            color: '#B8B0C8',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Voice-narrated · Illustrated · Personalised · Free to start
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
