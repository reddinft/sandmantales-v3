
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
