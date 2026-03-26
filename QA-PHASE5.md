# QA Gate — Phase 5: Auth + User Account
**Verdict: ❌ FAIL**
**Date:** 2026-03-26
**QA Engineer:** Oli

---

## Summary

Phase 5 is mostly solid — the auth library, API routes, account page, and middleware are all well-implemented. Two issues block PASS: a carryover from Phase 4 (SavePrompt still redirects instead of opening the modal) and a missing Supabase migration for the `increment_guest_story_count` RPC.

---

## Acceptance Criteria Results

### Auth lib ✅
- [x] `src/lib/auth.ts` exists — `getUser`, `getUserTier`, `migrateGuestToUser` all present and correct
- [x] `src/lib/auth-client.ts` exists — `signUp`, `signIn`, `signInWithMagicLink`, `signOut` all present
- [x] `migrateGuestToUser` — transfers stories to `user_id`, updates `usage_counts`, deletes guest session row. Cookie is cleared by the client caller (`SignInModal.tsx` line: `document.cookie = 'smt_guest_id=; Max-Age=0; path=/'`) — correct architecture for a server-side function.

### Auth API ✅
- [x] `src/app/api/auth/route.ts` — handles `signup`, `signin`, `signout`, `magic-link`
- [x] Signup handler calls `migrateGuestToUser(userId, guestSessionId)` after user creation ✅

### SignInModal ✅ / ❌
- [x] `src/components/auth/SignInModal.tsx` — overlay modal with tabs (Sign In / Create Account) and magic link option ✅
- [ ] **SavePrompt fix from Phase 4: NOT DONE ❌**
  - `src/components/story/StoryCreationFlow.tsx` line ~160:
    ```js
    onSave={() => {
      // Open sign-up — for now navigate to auth page
      window.location.href = '/auth/signup'
    }}
    ```
  - This is a hard redirect to `/auth/signup` (a non-existent route), **not** opening `SignInModal`.
  - Required fix: `onSave` should set a state flag that opens `<SignInModal>` inline.

### Account page ✅
- [x] `src/app/account/page.tsx` — server component (not a stub)
- [x] Tier badge (Free / Monthly / Lifetime) with styled colors
- [x] Story history — list of past stories with thumbnail, name, prompt, date
- [x] Usage count + progress bar for free tier (color-coded at 66%/100%)
- [x] Sign out button — via `<SignOutButton />` client component

### Middleware ✅
- [x] `src/proxy.ts` — Next.js 16 Turbopack picks this up as middleware (confirmed in build output as `ƒ Proxy (Middleware)`)
- [x] Redirects `/account` → `/?signin=true` for unauthenticated users
- [x] `HomepageSignInGate` reads `?signin=true` param and auto-opens `SignInModal` ✅
- [x] Homepage (`page.tsx`) passes `autoOpen={params.signin === 'true'}` to `HomepageSignInGate` ✅

### Guest migration ✅
- [x] `migrateGuestToUser` reads `guestSessionId` param (sourced from `smt_guest_id` cookie by caller), transfers stories, updates usage counts ✅

### Guest RPC (`increment_guest_story_count`) ❌
- [ ] **Missing from `supabase/migrations/` ❌**
  - `supabase/migrations/` contains only:
    - `001_initial_schema.sql`
    - `002_usage_rpc.sql` — defines `increment_usage` only
  - `increment_guest_story_count` is called in `src/lib/usage.ts`:
    ```ts
    await supabase.rpc('increment_guest_story_count', { session_id: guestSessionId })
    ```
  - There is a fallback in `incrementGuestUsage` (manual read-then-write) but the RPC itself is absent from migrations. This was flagged in Phase 4 and was NOT added in Phase 5.
  - Required fix: Add migration `003_guest_usage_rpc.sql` with:
    ```sql
    create or replace function increment_guest_story_count(session_id text)
    returns void as $$
      update guest_sessions
      set story_count = story_count + 1
      where id = session_id;
    $$ language sql security definer;
    ```

### Build ✅
- [x] `npm run build` passes — all 15 pages compiled successfully
- Note: Warning `supabaseUrl is required` during static gen of `/api/story/count` is expected (no env vars at build time) and non-critical.

---

## Issues Requiring Fix (Kit)

### 1. SavePrompt still redirects — Phase 4 carryover (HIGH)
**File:** `src/components/story/StoryCreationFlow.tsx`
**Problem:** `onSave` in `<SavePrompt>` does `window.location.href = '/auth/signup'` — hard redirect to a non-existent route.
**Required:** Open `<SignInModal initialTab="signup">` inline. Add `showSignInModal` state, render `<SignInModal>` in the component tree, set it on `onSave`.

### 2. `increment_guest_story_count` RPC not in migrations (HIGH)
**File:** `supabase/migrations/` — missing
**Problem:** `src/lib/usage.ts::incrementGuestUsage` calls `rpc('increment_guest_story_count')`. No migration defines it. The fallback works but the RPC will fail silently on every guest story creation in production.
**Required:** Add `supabase/migrations/003_guest_usage_rpc.sql` defining `increment_guest_story_count(session_id text)`.

---

## Phase 6 (Stripe Payments) Status

**🔴 Blocked** — Phase 5 must PASS before Phase 6 is unblocked. Fix the two issues above and re-run QA gate.

Note: Stripe route files (`/api/stripe/checkout`, `/api/stripe/portal`, `/api/stripe/webhook`) are already scaffolded in the project. Phase 6 can move quickly once Phase 5 is cleared.

## Fix Verification

**Date:** 2026-03-26 | **By:** Oli

### Fix 1 — SavePrompt modal wiring ✅ PASS
- `showSignInModal` state exists (line 47)
- `SignInModal` imported (line 10) and rendered in tree (lines 195–199)
- `onSave` calls `setShowSignInModal(true)` — NOT `window.location.href` (line 187)
- `<SignInModal>` has `initialTab="signup"` (line 198)

### Fix 2 — Guest RPC migration ✅ PASS
- `supabase/migrations/003_guest_usage_rpc.sql` exists
- Defines `increment_guest_story_count(p_session_id text)` with atomic UPDATE on `guest_sessions`
- `src/lib/usage.ts` calls `rpc('increment_guest_story_count', { p_session_id: ... })` — param name matches SQL exactly

### Build ✅ PASS
- `npm run build` completes with no errors. All routes compiled cleanly.

**Overall verdict: PASS** — both fixes are correctly implemented and build is green.
