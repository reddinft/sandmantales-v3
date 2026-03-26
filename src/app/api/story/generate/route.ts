import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'
import { generateStoryText } from '@/lib/story-generator'
import { generateAndUploadAudio } from '@/lib/elevenlabs'
import { generateIllustration } from '@/lib/falai'
import {
  getGuestUsage,
  getAuthUserUsage,
  ensureGuestSession,
  incrementGuestUsage,
  incrementAuthUserUsage,
} from '@/lib/usage'

// Allow up to 60s for full pipeline (OpenAI + ElevenLabs + fal.ai)
export const maxDuration = 60

interface GenerateRequest {
  childName: string
  childAge: number
  prompt: string
  guestSessionId?: string
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  // ── Step 1: Parse & validate ──────────────────────────────────────────────
  let body: GenerateRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { childName, childAge, prompt, guestSessionId } = body

  if (!childName || typeof childName !== 'string' || childName.trim().length < 1 || childName.trim().length > 50) {
    return NextResponse.json(
      { error: 'childName is required and must be 1–50 characters' },
      { status: 400 }
    )
  }

  if (typeof childAge !== 'number' || childAge < 3 || childAge > 8) {
    return NextResponse.json(
      { error: 'childAge is required and must be between 3 and 8' },
      { status: 400 }
    )
  }

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10 || prompt.trim().length > 500) {
    return NextResponse.json(
      { error: 'prompt is required and must be 10–500 characters' },
      { status: 400 }
    )
  }

  // ── Step 2: Auth & usage check ────────────────────────────────────────────
  const user = await getUser()
  let resolvedGuestSessionId: string | null = null

  if (user) {
    const usage = await getAuthUserUsage(user.id)
    if (!usage.allowed) {
      return NextResponse.json(
        { error: 'limit_reached', upgradeUrl: '/pricing' },
        { status: 402 }
      )
    }
  } else {
    // Guest flow
    resolvedGuestSessionId = guestSessionId?.trim() || nanoid()
    await ensureGuestSession(resolvedGuestSessionId)
    const usage = await getGuestUsage(resolvedGuestSessionId)
    if (!usage.allowed) {
      return NextResponse.json(
        { error: 'limit_reached', upgradeUrl: '/pricing' },
        { status: 402 }
      )
    }
  }

  // ── Step 3: Generate story text ───────────────────────────────────────────
  let storyText: string
  try {
    storyText = await generateStoryText(childName.trim(), childAge, prompt.trim())
  } catch (err) {
    console.error('[generate] story generation failed:', err)
    return NextResponse.json(
      { error: 'Story generation failed. Please try again.' },
      { status: 500 }
    )
  }

  // Generate a story ID up front so we can use it for audio filename
  const storyId = nanoid()

  // ── Step 4: TTS (graceful degradation) ───────────────────────────────────
  const audioUrlPromise = generateAndUploadAudio(storyText, storyId)

  // ── Step 5: Illustration (graceful degradation) ───────────────────────────
  const illustrationPromise = generateIllustration(storyText, childName.trim())

  // Run TTS + image in parallel
  const [audioUrl, { imageUrl, imageCostUsd }] = await Promise.all([
    audioUrlPromise,
    illustrationPromise,
  ])

  // ── Step 6: Save to Supabase ──────────────────────────────────────────────
  const supabase = getServiceClient()

  await supabase.from('stories').insert({
    id: storyId,
    user_id: user?.id ?? null,
    guest_session_id: resolvedGuestSessionId,
    child_name: childName.trim(),
    child_age: childAge,
    prompt: prompt.trim(),
    story_text: storyText,
    audio_url: audioUrl,
    image_url: imageUrl,
    image_cost_usd: imageCostUsd,
  })

  // Increment usage counters
  if (user) {
    await incrementAuthUserUsage(user.id)
  } else if (resolvedGuestSessionId) {
    await incrementGuestUsage(resolvedGuestSessionId)
  }

  return NextResponse.json({
    storyId,
    storyText,
    audioUrl,
    imageUrl,
    imageCostUsd,
  })
}
