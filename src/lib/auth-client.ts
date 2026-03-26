'use client'

/**
 * Auth helpers — CLIENT ONLY
 *
 * These functions use createBrowserClient and are safe to import from
 * 'use client' components. Never import from Server Components.
 */

import { createBrowserClient } from './supabase'

// ── Sign up ────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data.user, error }
}

// ── Sign in ────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, error }
}

// ── Magic link ─────────────────────────────────────────────────────────────

export async function signInWithMagicLink(email: string) {
  const supabase = createBrowserClient()
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/account`
      : undefined
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  })
  return { error }
}

// ── Sign out ────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = createBrowserClient()
  await supabase.auth.signOut()
}
