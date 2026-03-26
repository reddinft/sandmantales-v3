/**
 * /api/auth — Auth route handler
 *
 * POST /api/auth?action=signup
 * POST /api/auth?action=signin
 * POST /api/auth?action=signout
 * POST /api/auth?action=magic-link
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'
import { migrateGuestToUser } from '@/lib/auth'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── GET — return current user ──────────────────────────────────────────────

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ user: null })

  const service = getServiceClient()
  const { data: profile } = await service
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    tier: profile?.subscription_tier ?? 'free',
  })
}

// ── POST — auth actions ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action')

  if (!action) {
    return NextResponse.json({ error: 'Missing action param' }, { status: 400 })
  }

  switch (action) {
    case 'signup': return handleSignUp(req)
    case 'signin': return handleSignIn(req)
    case 'signout': return handleSignOut()
    case 'magic-link': return handleMagicLink(req)
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }
}

// ── Handlers ───────────────────────────────────────────────────────────────

async function handleSignUp(req: NextRequest) {
  let body: { email?: string; password?: string; guestSessionId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password, guestSessionId } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Sign-up failed' }, { status: 400 })
  }

  const userId = data.user.id

  // Insert public user profile (ignore conflict if trigger already created it)
  const service = getServiceClient()
  await service.from('users').upsert(
    { id: userId, email, subscription_tier: 'free' },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  // Migrate guest stories if guestSessionId provided
  if (guestSessionId) {
    await migrateGuestToUser(userId, guestSessionId)
  }

  return NextResponse.json({
    user: { id: userId, email: data.user.email },
    tier: 'free',
  })
}

async function handleSignIn(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Sign-in failed' }, { status: 401 })
  }

  const service = getServiceClient()
  const { data: profile } = await service
    .from('users')
    .select('subscription_tier')
    .eq('id', data.user.id)
    .single()

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email },
    tier: profile?.subscription_tier ?? 'free',
  })
}

async function handleSignOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}

async function handleMagicLink(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email } = body
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/account`
          : 'http://localhost:3000/account',
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, message: 'Magic link sent — check your email.' })
}
