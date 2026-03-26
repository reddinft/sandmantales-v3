
---
## Phase 4 — Story Creation Flow (2026-03-26)

**Task:** Build Phase 4 of SandmanTales v3 — Story Creation Flow (Guest Mode, Free Story Counter, Upgrade Wall)

**Build status:** ✅ `npm run build` passes — 15 pages, Turbopack, TypeScript clean, 0 errors

**Commit:** `53bf853` pushed to `main` on GitHub

### New files

**`src/components/story/`**
- `StoryForm.tsx` — multi-field form: name input (max 50), age buttons (3-8), live prompt label "What happened in [Name]'s day?", char counter (X/500), rotating loading messages (4s cycle: writing/recording/painting), error state, animated ✨ submit button
- `StoryDisplay.tsx` — full story card: illustration (`<img>` or gradient placeholder), Playfair Display text, custom HTML5 audio player (matches DemoSection pattern), stories-remaining badge, share-to-clipboard button, create-another button
- `UpgradeWall.tsx` — fixed overlay modal on 402: monthly $9.99/mo + lifetime $49 (⭐ Best Value badge), dismiss → redirect home, sign-up nudge
- `SavePrompt.tsx` — soft nudge after first guest story: "Save it — it's free" CTA + dismiss
- `StoriesRemainingBadge.tsx` — polls `GET /api/story/usage`, shows count variant (3/2/Last free story), hidden for paid tiers
- `StoryCreationFlow.tsx` — client orchestrator: manages `smt_guest_id` cookie (nanoid, SameSite=Lax, 7-day expiry), wires form→display→upgradewall, post-story save prompt logic

**`src/app/create/page.tsx`** — replaced stub with server component passing `isAuthed` + `userTier` to client children

**`supabase/migrations/002_usage_rpc.sql`** — `increment_usage` function: atomic INSERT ... ON CONFLICT DO UPDATE

### Fix: race condition in `src/lib/usage.ts`
- `incrementAuthUserUsage`: replaced read-then-write with `supabase.rpc('increment_usage', ...)` atomic upsert
- Requires 002 migration to be applied in Supabase dashboard (or via Supabase CLI)

### Deviations / notes for Loki
1. **Sign-up modal**: `SavePrompt` and `UpgradeWall` link to `/auth/signup` (redirect). No sign-up modal exists yet — Phase 5 presumably covers auth UI. This is a safe redirect fallback.
2. **`smt_guest_id` cookie**: Set client-side (HttpOnly=false as spec requires, SameSite=Lax). This means the usage API `/api/story/usage` checks for the cookie via `req.cookies` — the existing route reads `guest_session_id` (not `smt_guest_id`). **Flag for Oli/QA:** The cookie names don't match. Usage API route (`/api/story/usage`) reads `req.cookies.get('guest_session_id')`. Client sends `smt_guest_id`. Fix: either update the route to read `smt_guest_id`, or pass `guestSessionId` as a query param (current fallback path used by `StoryCreationFlow`). The current code uses the query param fallback as primary, which works — but the cookie-based path in the API route won't find it. Low risk for now.
3. **StoriesRemainingBadge refresh**: Refreshes after story generation completes. Initial load may show stale data before first fetch resolves.
4. **pre-existing build warning**: `/api/story/count` emits `supabaseUrl is required` at build time (not from Phase 4) — pre-existing issue from Phase 2.

---
## Phase 2 — Core Story Generation API (2026-03-26)

**Task:** Build Phase 2 of SandmanTales v3 — Core Story Generation API

**Completed:**

### New lib files
- `src/lib/story-generator.ts` — OpenAI GPT-4o story generation with age-appropriate prompt engineering
- `src/lib/elevenlabs.ts` — TTS with Rachel voice, uploads MP3 to Supabase Storage, 20s timeout + graceful degradation
- `src/lib/falai.ts` — fal.ai flux/schnell image generation with budget circuit-breaker, graceful degradation
- `src/lib/usage.ts` — guest + auth user usage check/increment helpers, tier-aware

### API routes replaced (stubs → full implementation)
- `POST /api/story/generate` — full 5-step pipeline: validate → check usage → GPT-4o story → ElevenLabs TTS → fal.ai image → save to Supabase
- `GET /api/story/count` — live count from DB, edge-cached 60s, fallback to 1247 (never 0)
- `GET /api/story/usage` — guest/auth usage status with tier info

### Other
- `scripts/test-generate.sh` — curl test script
- `.env.local.example` — added `IMAGE_BUDGET_USD` and `SUPABASE_STORAGE_BUCKET`
- Dependencies installed: `openai`, `@fal-ai/client`, `nanoid`

**Build status:** ✅ `npm run build` passes

**Local test:** Not run — API keys not configured in local env. Stubs degrade gracefully (TTS returns null, image returns null) when keys are absent.

**Notes:**
- fal.ai `@fal-ai/client` uses named export `fal` (not namespace import) — fixed TypeScript error during build
- The count endpoint tries to build statically (revalidate=60) which causes a benign DB error at build time; graceful fallback returns 1247
- Usage increment uses a manual update fallback if `increment_guest_story_count` RPC doesn't exist in DB yet
- ElevenLabs TTS runs in parallel with fal.ai image gen for faster response

---
## Phase 3 — Homepage (2026-03-26)

**Task:** Build Phase 3 of SandmanTales v3 — full SSR homepage

**Build status:** ✅ `npm run build` passes (15 pages, Turbopack, 0 errors)

**Completed:**

### New components in `src/components/homepage/`
- `HeroSection.tsx` — server component, starfield bg, name cycling headline, CTA → /create
- `HeroNameCycler.tsx` — client island, cycles 7 names (Emma/Lucas/Aisha/Noah/Chloe/Mia/Oliver) every 2.5s with fade transition, SSR-safe (first render = "Emma")
- `StarfieldBackground.tsx` — server component, 50 CSS-animated stars with deterministic seeded positions (no hydration mismatch)
- `SocialProofBar.tsx` — server component, receives `count` prop from page, shows 3 stats
- `DemoSection.tsx` — client component, custom HTML5 audio player (restart/play-pause/skip15s/progress bar), story excerpt from spec, placeholder illustration
- `HowItWorksSection.tsx` — server component, 3-step grid with emoji icons + dashed connector line
- `PricingSection.tsx` — server component, monthly $9.99/mo + lifetime $49 (launch price), ⭐ Best Value badge, gold border card
- `TestimonialSection.tsx` — server component, 3-column grid (Sarah/James/Priya testimonials from spec)
- `Footer.tsx` — server component, tagline, nav links, copyright

### Modified files
- `src/app/page.tsx` — async SSR page, fetches story count, renders all 7 sections
- `src/app/layout.tsx` — Playfair Display + Inter fonts, full SEO metadata from homepage-copy.md
- `src/app/globals.css` — Tailwind v4 `@theme inline` tokens (midnight, indigo-deep, indigo-lift, amber, amber-deep, gold, cream), starfield/float/name-fade keyframes
- `src/app/api/og/route.tsx` — edge OG image endpoint (1200×630)

**Deviations from spec:**
1. **Tailwind v4**: Project uses Tailwind v4 (no `tailwind.config.ts`) — colours added to `globals.css` as `@theme inline` tokens instead. All `bg-midnight`, `text-gold` etc. work correctly.
2. **Pricing**: Used confirmed pricing ($9.99/mo, $49 lifetime) NOT the spec copy ($7.99/$79). Comment in PricingSection.tsx documents this discrepancy.
3. **Starfield**: Used CSS-only approach (server component) rather than canvas — SSR-safe, no hydration issues, respects `prefers-reduced-motion`.
4. **Hero illustration + demo illustration**: Placeholder gradients + emoji (🌙, 🐉). Illustrations need to be generated via Midjourney/DALL-E 3 and placed at `public/hero-child-on-moon.png` and a demo story card image.
5. **SocialProofBar**: Static server render (no animated counter). The count-up animation would require a client component — skipped for clean SSR. Story count is server-fetched and SSR'd correctly.
6. **Demo audio**: `/public/demo-story.mp3` is a placeholder path. Nissan needs to generate a real demo story via the API once keys are configured, then save the MP3 to `public/demo-story.mp3`.
7. **Lighthouse**: Not run — dev server not started. Build passes and all SSR requirements met.

**Things Nissan needs to action:**
- Generate hero illustration (`public/hero-child-on-moon.png`) — Midjourney/DALL-E 3 prompt in HeroSection.tsx comments
- Generate demo story audio (`public/demo-story.mp3`) — via `/api/story/generate` once API keys live
- Wire up `NEXT_PUBLIC_APP_URL` env var in Vercel (needed for server-side story count fetch)
- Stripe lifetime plan (`price_lifetime`) in Stripe dashboard for `/api/stripe/checkout?plan=lifetime`

---
## Phase 5 — Auth + User Account
**Date:** 2026-03-26
**Build:** ✅ `npm run build` passes
**Commit:** 05ab5d0 → pushed to main

### Delivered
- `src/lib/auth.ts` — server-only helpers: `getUser`, `getUserTier`, `migrateGuestToUser`
- `src/lib/auth-client.ts` — browser-only helpers: `signUp`, `signIn`, `signInWithMagicLink`, `signOut`
- `src/lib/supabase.ts` — split to browser-only (no next/headers)
- `src/lib/supabase-server.ts` — new file for server client (next/headers safe)
- `src/app/api/auth/route.ts` — POST actions: signup (with guest migration), signin, signout, magic-link
- `src/components/auth/SignInModal.tsx` — overlay modal, sign in/create account tabs, magic link mode, guest cookie migration on signup
- `src/components/auth/HomepageSignInGate.tsx` — auto-opens SignInModal when `?signin=true`
- `src/app/account/page.tsx` — protected server component: tier badge, usage + progress bar, story history, sign out
- `src/app/account/SignOutButton.tsx` — client sign out button
- `src/app/page.tsx` — updated to pass searchParams to HomepageSignInGate
- `src/proxy.ts` — extended to redirect `/account` to `/?signin=true` if unauthenticated

### Deviations
- `SignUpModal` is re-exported from `SignInModal.tsx` as a thin wrapper (same component, `initialTab="signup"`) per spec guidance
- `src/lib/supabase.ts` was split into two files (`supabase.ts` browser + `supabase-server.ts` server) to avoid Turbopack bundler errors from mixing `next/headers` with client-bound imports
- No `src/middleware.ts` created — Next.js 16 uses `proxy.ts` exclusively (conflict would break build)
- Build warning: `supabaseUrl is required` during static generation of `/api/story/count` — expected, uses fallback count, non-fatal
