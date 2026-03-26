import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/story/[id] — fetch story (public or owned by current user)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Story ID required' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data: story, error } = await supabase
    .from('stories')
    .select('id, child_name, child_age, story_text, audio_url, image_url, is_public, user_id, created_at')
    .eq('id', id)
    .single()

  if (error || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  // If story is public, return it
  if (story.is_public) {
    return NextResponse.json(story)
  }

  // If story is private, only the owner can see it
  const user = await getUser()
  if (!user || user.id !== story.user_id) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  return NextResponse.json(story)
}

// PATCH /api/story/[id] — set is_public = true (must own the story)
export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Story ID required' }, { status: 400 })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = getServiceClient()

  // Verify ownership before updating
  const { data: story } = await supabase
    .from('stories')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  if (story.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('stories')
    .update({ is_public: true })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
  }

  return NextResponse.json({ success: true, is_public: true })
}
