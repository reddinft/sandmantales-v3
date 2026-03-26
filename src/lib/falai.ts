import { fal } from '@fal-ai/client'

const FAL_MODEL = 'fal-ai/flux/schnell'
const COST_PER_IMAGE_USD = 0.003 // approximate cost for flux/schnell at 768x512
const DEFAULT_BUDGET_USD = 20

interface FalResult {
  imageUrl: string | null
  imageCostUsd: number | null
}

/**
 * Check if we're within the monthly image budget.
 * In production this would query a cost tracking table.
 * For now we use a simple env var cap — the cost is logged per story.
 */
async function isWithinBudget(): Promise<boolean> {
  const budget = parseFloat(process.env.IMAGE_BUDGET_USD ?? String(DEFAULT_BUDGET_USD))
  // If IMAGE_BUDGET_USD is set to 0, disable image gen
  if (budget <= 0) return false
  // TODO: in a future phase, sum image_cost_usd from stories table for current month
  // For now we allow generation and rely on monitoring
  return true
}

function buildImagePrompt(storyText: string, childName: string): string {
  // Extract a short scene description from the story
  const snippet = storyText
    .split('\n')
    .filter(l => l.trim().length > 20)
    .slice(1, 3) // skip first paragraph (usually intro), grab middle
    .join(' ')
    .slice(0, 150)
    .replace(new RegExp(childName, 'gi'), 'a small child') // anonymise

  return (
    `children's book illustration, ${snippet}, ` +
    `warm watercolour style, soft lighting, pastel colours, gentle, dreamlike, child-safe, bedtime scene`
  )
}

export async function generateIllustration(
  storyText: string,
  childName: string
): Promise<FalResult> {
  try {
    const withinBudget = await isWithinBudget()
    if (!withinBudget) {
      console.info('[falai] skipping image gen — budget exceeded')
      return { imageUrl: null, imageCostUsd: null }
    }

    // Configure credentials
    fal.config({ credentials: process.env.FAL_API_KEY })

    const imagePrompt = buildImagePrompt(storyText, childName)

    const result = await fal.run(FAL_MODEL, {
      input: {
        prompt: imagePrompt,
        image_size: 'landscape_4_3', // ~768x576, closest to 768x512
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
    }) as { images?: Array<{ url: string }> }

    const imageUrl = result?.images?.[0]?.url ?? null
    if (!imageUrl) {
      console.warn('[falai] no image URL in response')
      return { imageUrl: null, imageCostUsd: null }
    }

    return { imageUrl, imageCostUsd: COST_PER_IMAGE_USD }
  } catch (err) {
    console.error('[falai] failed:', err instanceof Error ? err.message : err)
    return { imageUrl: null, imageCostUsd: null }
  }
}
