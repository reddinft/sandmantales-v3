import { ElevenLabsClient } from 'elevenlabs'
import { createClient } from '@supabase/supabase-js'

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel — warm, calm, storyteller
const MODEL_ID = 'eleven_turbo_v2'
const TTS_TIMEOUT_MS = 20000

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function generateAndUploadAudio(
  storyText: string,
  storyId: string
): Promise<string | null> {
  try {
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    })

    // Race TTS against timeout
    const audioStream = await Promise.race([
      client.textToSpeech.convert(VOICE_ID, {
        text: storyText,
        model_id: MODEL_ID,
        output_format: 'mp3_44100_128',
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('ElevenLabs timeout')), TTS_TIMEOUT_MS)
      ),
    ])

    // Collect stream into buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Upload to Supabase Storage
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'story-audio'
    const filePath = `${storyId}.mp3`
    const supabase = getServiceClient()

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('[elevenlabs] upload error:', uploadError.message)
      return null
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  } catch (err) {
    console.error('[elevenlabs] failed:', err instanceof Error ? err.message : err)
    return null
  }
}
