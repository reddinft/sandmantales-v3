
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
