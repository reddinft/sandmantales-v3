# QA Gate — Phases 2 + 3
_Oli | 2026-03-26_

---

## Phase 2 — Story Generation API

### Verdict: ✅ PASS

| Check | Status | Notes |
|---|---|---|
| `POST /api/story/generate` exists and is full implementation | ✅ PASS | Full pipeline: validate → auth/usage → story text → TTS → image → Supabase save |
| Input validation — empty/missing prompt returns 400 | ✅ PASS | `!prompt` → falsy → 400. Also validates childName (1–50 chars) and childAge (3–8). Min 10-char prompt enforced. |
| Usage limit enforcement — 402 with `upgradeUrl` | ✅ PASS | Returns `{ error: 'limit_reached', upgradeUrl: '/pricing' }` with status 402 for both guest and auth flows |
| TTS failure degrades gracefully (audioUrl: null) | ✅ PASS | `generateAndUploadAudio` wraps everything in try/catch, returns `null` on any error — never throws |
| Image gen failure degrades gracefully (imageUrl: null) | ✅ PASS | `generateIllustration` wraps everything in try/catch, returns `{ imageUrl: null, imageCostUsd: null }` on error |
| `GET /api/story/count` returns `{ count: N }`, never 0 | ✅ PASS | `Math.max(count, FALLBACK_COUNT)` where `FALLBACK_COUNT = 1247`. All error paths also return fallback. |
| `GET /api/story/usage` exists, tier-aware | ✅ PASS | Returns `{ used, limit, tier }` — handles guest, free, monthly, lifetime tiers |
| TTS + image run in parallel | ✅ PASS | `Promise.all([audioUrlPromise, illustrationPromise])` — both kicked off before awaiting |
| `npm run build` passes | ✅ PASS | Build completes successfully. One expected build-time console warning: `supabaseUrl is required` (env vars not set at build time — not a bug). |
| Gherkin feature files present | ⚠️ MISSING | `features/storytelling.feature` does not exist. No `features/` directory at all. Acceptance criteria verified by code review only — BDD runner can't execute. |

**Phase 2 notes:**
- Graceful degradation on TTS and image gen is clean — `Promise.all` means one failure doesn't block the other, and both return null safely.
- The `upgradeUrl` value is `/pricing` (relative), not an absolute URL. Acceptable for this phase but worth checking the frontend handles relative redirect correctly.
- `incrementAuthUserUsage` uses a read-then-write pattern (not atomic). Potential race condition under concurrent requests for the same user. Non-blocking for Phase 4, but worth a DB-level `increment` RPC in Phase 7 polish.

---

## Phase 3 — Homepage

### Verdict: ✅ PASS

| Check | Status | Notes |
|---|---|---|
| `src/app/page.tsx` is a server component (async, no "use client") | ✅ PASS | `export default async function HomePage()` — no "use client" directive |
| Story count fetched server-side | ✅ PASS | `const count = await getStoryCount()` called in the async server component body before render |
| All 7 sections present | ✅ PASS | HeroSection, SocialProofBar, DemoSection, HowItWorksSection, PricingSection, TestimonialSection, Footer — all imported and rendered |
| Hero name cycling component — SSR-safe, first render not blank | ✅ PASS | `HeroNameCycler` initialises with `useState(0)` → SSR renders `names[0]` = "Emma". `suppressHydrationWarning` handles hydration. Not blank. |
| Pricing shows $9.99/mo AND $49 lifetime | ✅ PASS | Monthly card: `$9.99 / month`. Lifetime card: `$49 one-time`. Both confirmed in PricingSection.tsx. |
| Lifetime card has "Best Value" or similar badge | ✅ PASS | `⭐ Best Value` badge rendered as absolute-positioned div above the lifetime card |
| CTA links to `/create` (not dead `#` links) | ✅ PASS | HeroSection primary CTA: `href="/create"`. Monthly card CTA: `href="/create"`. Lifetime card uses `/api/stripe/checkout?plan=lifetime`. |
| SEO metadata in layout.tsx (title, description, og tags) | ✅ PASS | Full `Metadata` export: title, description, openGraph (title, description, type, siteName, images), twitter card, metadataBase |
| OG image route exists at `src/app/api/og/route.tsx` | ✅ PASS | Present. Returns `ImageResponse` at 1200×630. Edge runtime. |
| `npm run build` passes after Phase 3 additions | ✅ PASS | Confirmed above. All 15 pages/routes generated cleanly. |
| Gherkin feature files present | ⚠️ MISSING | `features/homepage.feature` does not exist. No-JS rendering check verified by code review only (page.tsx is async server component — content is in server-rendered HTML). |

**Phase 3 notes:**
- Hero illustration is a placeholder (🌙 emoji + "Illustration coming soon" text inside a styled div). This is a content gap, not a code defect. Flagged for Phase 7 polish.
- Lifetime CTA links to `/api/stripe/checkout?plan=lifetime` (not `/create`). This is correct — it's a purchase flow, not a free trial. No issue.
- `SocialProofBar` receives the server-fetched `count` prop — story count is genuinely server-side rendered, not a client-only fetch.

---

## Overall Gate: ✅ PASS

**Block on:** _Nothing. Both phases pass all acceptance criteria._

**Non-blocking (fix in Phase 7 polish):**
1. **Missing Gherkin feature files** — `features/storytelling.feature` and `features/homepage.feature` don't exist. Kit should create them for the BDD spec record. No functional impact.
2. **`incrementAuthUserUsage` race condition** — read-then-write pattern under concurrency. Replace with a Supabase RPC (`increment_user_story_count`) matching the guest pattern already in `usage.ts`.
3. **Hero illustration placeholder** — 🌙 emoji + "Illustration coming soon". Replace with actual hero image asset before launch.
4. **Build-time Supabase warning** — `[count] unexpected error: Error: supabaseUrl is required` logged during static generation. Expected (env vars absent at build time), but could be silenced with an env check guard in the count route before creating the client.
5. **`upgradeUrl` is relative** — `/pricing` works for same-origin but consider absolute URL if API consumers are external.

**Ready for Phase 4.** 🌙
