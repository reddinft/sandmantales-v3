'use client'

import { useState } from 'react'

interface ShareStoryButtonProps {
  storyId: string
}

export function ShareStoryButton({ storyId }: ShareStoryButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleShare = async () => {
    setState('loading')
    try {
      const res = await fetch(`/api/story/${storyId}`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error('Failed')
      setState('done')
      // Copy URL to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/story/${storyId}`)
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '10px',
          background: 'rgba(74,222,128,0.12)',
          border: '1px solid rgba(74,222,128,0.3)',
          color: '#4ade80',
          fontFamily: 'var(--font-inter)',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        ✅ Story is now public — link copied!
      </div>
    )
  }

  return (
    <button
      onClick={handleShare}
      disabled={state === 'loading'}
      style={{
        padding: '10px 18px',
        borderRadius: '10px',
        border: '1.5px solid rgba(245,197,66,0.3)',
        background: 'transparent',
        color: '#F5C542',
        fontFamily: 'var(--font-inter)',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: state === 'loading' ? 'not-allowed' : 'pointer',
        opacity: state === 'loading' ? 0.7 : 1,
        transition: 'all 0.15s',
      }}
    >
      {state === 'loading' ? '⏳ Making public…' : state === 'error' ? '❌ Try again' : '🔗 Share this story'}
    </button>
  )
}
