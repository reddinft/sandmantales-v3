import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sandmantales.com'

async function getPublicStories(): Promise<Array<{ id: string; created_at: string }>> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('stories')
      .select('id, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(1000)

    return data ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP_URL}/create`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/account`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  const stories = await getPublicStories()
  const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${APP_URL}/story/${story.id}`,
    lastModified: new Date(story.created_at),
    changeFrequency: 'never',
    priority: 0.6,
  }))

  return [...staticRoutes, ...storyRoutes]
}
