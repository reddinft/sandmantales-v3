import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateStoryText(
  childName: string,
  childAge: number,
  prompt: string
): Promise<string> {
  const ageGuidance =
    childAge <= 4
      ? 'Use very simple, short sentences. Vocabulary should be basic — words a 3–4 year old knows.'
      : childAge <= 6
      ? 'Use simple sentences and gentle vocabulary suitable for a 5–6 year old.'
      : 'You can use slightly richer vocabulary and longer sentences appropriate for a 7–8 year old.'

  const systemPrompt = `You are a warm, gentle bedtime story narrator for young children. 
Your stories are calming, cozy, and always end with the child drifting off to sleep feeling safe and loved.
${ageGuidance}
Follow these rules strictly:
- Write 250–400 words
- Use the child's name at least 3 times throughout the story
- Weave in what happened during the child's day naturally — don't just retell it, transform it into something magical or comforting
- Warm, sleepy, calming tone throughout
- The story always ends with the child character going to sleep peacefully
- No scary elements
- Any conflict or tension must resolve warmly and happily before the end
- Use soothing language: soft light, warm blankets, gentle breezes, quiet stars, cozy beds`

  const userPrompt = `Write a bedtime story for ${childName}, who is ${childAge} years old.
Today, this happened: ${prompt}
Weave this into a gentle, magical bedtime story. Use ${childName}'s name at least 3 times.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 600,
    temperature: 0.85,
  })

  const text = completion.choices[0]?.message?.content
  if (!text) throw new Error('OpenAI returned empty story')
  return text.trim()
}
