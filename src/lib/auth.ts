/**
 * Auth helpers — SERVER ONLY
 *
 * These functions use `next/headers` via createServerClient.
 * Use only in Server Components and Route Handlers.
 *
 * For client-side auth (signIn, signUp, signOut), see auth-client.ts
 */

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from './supabase-server'

export type Tier = 'free' | 'monthly' | 'lifetime'

// ── Session / user helpers ────────────────────────────────────────────────

export async function getSession() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserTier(userId: string): Promise<Tier> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single()
  const tier = data?.subscription_tier ?? 'free'
  if (tier === 'monthly' || tier === 'lifetime') return tier
  return 'free'
}

// ── Service-role helpers ───────────────────────────────────────────────────

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Migrate a guest's stories and usage to a newly created auth user.
 * Called from the /api/auth signup route handler after successful sign-up.
 */
export async function migrateGuestToUser(
  userId: string,
  guestSessionId: string
): Promise<void> {
  const supabase = getServiceClient()

  // 1. Transfer stories
  await supabase
    .from('stories')
    .update({ user_id: userId, guest_session_id: null })
    .eq('guest_session_id', guestSessionId)

  // 2. Count how many stories the guest had
  const { data: guestRow } = await supabase
    .from('guest_sessions')
    .select('story_count')
    .eq('id', guestSessionId)
    .single()

  const guestCount = guestRow?.story_count ?? 0

  // 3. Transfer usage count to user's current period
  if (guestCount > 0) {
    const now = new Date()
    const periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    await supabase.from('usage_counts').upsert(
      { user_id: userId, period_start: periodStart, story_count: guestCount },
      { onConflict: 'user_id,period_start' }
    )
  }

  // 4. Delete the guest session row
  await supabase.from('guest_sessions').delete().eq('id', guestSessionId)
}
