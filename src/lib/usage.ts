import { createClient } from '@supabase/supabase-js'

const GUEST_LIMIT = 3
const FREE_LIMIT = 3

export type Tier = 'guest' | 'free' | 'monthly' | 'lifetime'

export interface UsageStatus {
  used: number
  limit: number | null // null = unlimited
  tier: Tier
  allowed: boolean
}

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

// ── Guest ────────────────────────────────────────────────────────────────────

export async function getGuestUsage(guestSessionId: string): Promise<UsageStatus> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from('guest_sessions')
    .select('story_count')
    .eq('id', guestSessionId)
    .single()

  const used = data?.story_count ?? 0
  return {
    used,
    limit: GUEST_LIMIT,
    tier: 'guest',
    allowed: used < GUEST_LIMIT,
  }
}

export async function ensureGuestSession(guestSessionId: string): Promise<void> {
  const supabase = getServiceClient()
  // Upsert so we don't fail if it already exists
  await supabase.from('guest_sessions').upsert(
    { id: guestSessionId, story_count: 0 },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}

export async function incrementGuestUsage(guestSessionId: string): Promise<void> {
  const supabase = getServiceClient()
  await supabase.rpc('increment_guest_story_count', { p_session_id: guestSessionId })
    .then(async ({ error }) => {
      if (error) {
        // Fallback: manual increment
        const { data } = await supabase
          .from('guest_sessions')
          .select('story_count')
          .eq('id', guestSessionId)
          .single()
        const count = (data?.story_count ?? 0) + 1
        await supabase
          .from('guest_sessions')
          .update({ story_count: count })
          .eq('id', guestSessionId)
      }
    })
}

// ── Auth user ─────────────────────────────────────────────────────────────────

export async function getAuthUserUsage(userId: string): Promise<UsageStatus> {
  const supabase = getServiceClient()

  // Get subscription tier
  const { data: userRow } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = (userRow?.subscription_tier ?? 'free') as Tier

  if (tier === 'monthly' || tier === 'lifetime') {
    return { used: 0, limit: null, tier, allowed: true }
  }

  // Free tier: check usage_counts for current period
  const periodStart = getPeriodStart()
  const { data: usageRow } = await supabase
    .from('usage_counts')
    .select('story_count')
    .eq('user_id', userId)
    .eq('period_start', periodStart)
    .single()

  const used = usageRow?.story_count ?? 0
  return {
    used,
    limit: FREE_LIMIT,
    tier: 'free',
    allowed: used < FREE_LIMIT,
  }
}

export async function incrementAuthUserUsage(userId: string): Promise<void> {
  const supabase = getServiceClient()
  const periodStart = getPeriodStart()

  // Atomic upsert via RPC — avoids read-then-write race condition
  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_period_start: periodStart,
  })
}
