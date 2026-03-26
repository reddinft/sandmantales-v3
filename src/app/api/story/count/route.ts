import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FALLBACK_COUNT = 1247

export const revalidate = 60 // ISR: cache at edge for 60s

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { count, error } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .not('story_text', 'is', null)

    if (error || count === null) {
      console.warn('[count] DB query failed, returning fallback:', error?.message)
      return NextResponse.json(
        { count: FALLBACK_COUNT },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      )
    }

    // Never return 0 — use fallback as floor
    const safeCount = Math.max(count, FALLBACK_COUNT)

    return NextResponse.json(
      { count: safeCount },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (err) {
    console.error('[count] unexpected error:', err)
    return NextResponse.json(
      { count: FALLBACK_COUNT },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  }
}
