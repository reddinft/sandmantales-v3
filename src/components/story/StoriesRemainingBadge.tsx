'use client'

import { useState, useEffect } from 'react'

interface UsageData {
  used: number
  limit: number | null
  tier: string
}

interface StoriesRemainingBadgeProps {
  guestSessionId?: string | null
}

export function StoriesRemainingBadge({ guestSessionId }: StoriesRemainingBadgeProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)

  useEffect(() => {
    const url = guestSessionId
      ? `/api/story/usage?guestSessionId=${encodeURIComponent(guestSessionId)}`
      : '/api/story/usage'

    fetch(url)
      .then(r => r.json())
      .then((data: UsageData) => setUsage(data))
      .catch(() => {})
  }, [guestSessionId])

  if (!usage) return null
  // Hide for paid tiers
  if (usage.limit === null) return null
  // Hide if used up (UpgradeWall handles that state)
  if (usage.used >= usage.limit) return null

  const remaining = usage.limit - usage.used

  let label: string
  if (remaining === 1) {
    label = '⚠️ Last free story'
  } else if (remaining === usage.limit) {
    label = `✨ ${remaining} free stories remaining`
  } else {
    label = `✨ ${remaining} free ${remaining === 1 ? 'story' : 'stories'} remaining`
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: remaining === 1 ? 'rgba(245,166,35,0.12)' : 'rgba(245,197,66,0.08)',
        border: `1px solid ${remaining === 1 ? 'rgba(245,166,35,0.4)' : 'rgba(245,197,66,0.2)'}`,
        borderRadius: '20px',
        padding: '5px 14px',
        marginBottom: '16px',
        fontFamily: 'var(--font-inter)',
        fontSize: '0.8rem',
        color: remaining === 1 ? '#F5A623' : '#F5C542',
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  )
}
