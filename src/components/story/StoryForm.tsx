'use client'

import { useState, useEffect, useRef } from 'react'

const AGES = [3, 4, 5, 6, 7, 8]

const LOADING_MESSAGES = [
  (name: string) => `Writing ${name}'s story...`,
  () => 'Recording the narration...',
  () => 'Painting the illustration...',
]

export interface StoryFormValues {
  childName: string
  childAge: number
  prompt: string
}

interface StoryFormProps {
  onSubmit: (values: StoryFormValues) => Promise<void>
  isLoading: boolean
  error?: string | null
}

export function StoryForm({ onSubmit, isLoading, error }: StoryFormProps) {
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState<number | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cycle loading messages
  useEffect(() => {
    if (isLoading) {
      setLoadingMsgIndex(0)
      intervalRef.current = setInterval(() => {
        setLoadingMsgIndex(i => (i + 1) % LOADING_MESSAGES.length)
      }, 4000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isLoading])

  const displayName = childName.trim() || 'your child'
  const promptLabel = `What happened in ${childName.trim() || "your child"}'s day?`
  const submitLabel = childName.trim()
    ? `Create ${childName.trim()}'s Story ✨`
    : 'Create Your Story ✨'

  const canSubmit = childName.trim().length >= 1 && childAge !== null && prompt.trim().length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isLoading || childAge === null) return
    await onSubmit({ childName: childName.trim(), childAge, prompt: prompt.trim() })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Child's name */}
      <div className="mb-6">
        <label
          htmlFor="childName"
          style={{
            display: 'block',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#B8B0C8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Child's Name
        </label>
        <input
          id="childName"
          type="text"
          value={childName}
          onChange={e => setChildName(e.target.value.slice(0, 50))}
          placeholder="e.g. Emma"
          maxLength={50}
          disabled={isLoading}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1.5px solid rgba(245,197,66,0.2)',
            background: 'rgba(255,255,255,0.04)',
            color: '#F4EFE6',
            fontFamily: 'var(--font-inter)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(245,197,66,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(245,197,66,0.2)')}
        />
      </div>

      {/* Age selector */}
      <div className="mb-6">
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#B8B0C8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Age
        </p>
        <div className="flex gap-2 flex-wrap">
          {AGES.map(age => (
            <button
              key={age}
              type="button"
              disabled={isLoading}
              onClick={() => setChildAge(age)}
              aria-pressed={childAge === age}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                border: childAge === age
                  ? '2px solid #F5C542'
                  : '1.5px solid rgba(245,197,66,0.2)',
                background: childAge === age
                  ? 'rgba(245,197,66,0.15)'
                  : 'rgba(255,255,255,0.04)',
                color: childAge === age ? '#F5C542' : '#B8B0C8',
                fontFamily: 'var(--font-inter)',
                fontSize: '1rem',
                fontWeight: childAge === age ? 700 : 400,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div className="mb-6">
        <label
          htmlFor="prompt"
          style={{
            display: 'block',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#B8B0C8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {promptLabel}
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value.slice(0, 500))}
          placeholder={`Tell us about ${displayName}'s day — a visit to the park, a funny moment, a new friend...`}
          maxLength={500}
          disabled={isLoading}
          rows={4}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1.5px solid rgba(245,197,66,0.2)',
            background: 'rgba(255,255,255,0.04)',
            color: '#F4EFE6',
            fontFamily: 'var(--font-inter)',
            fontSize: '1rem',
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(245,197,66,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(245,197,66,0.2)')}
        />
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.75rem',
            color: prompt.length > 450 ? '#F5A623' : '#B8B0C8',
            textAlign: 'right',
            marginTop: '4px',
          }}
        >
          {prompt.length} / 500
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.9rem',
            color: '#FCA5A5',
          }}
        >
          😔 {error}
        </div>
      )}

      {/* Loading progress */}
      {isLoading && (
        <div
          style={{
            background: 'rgba(245,197,66,0.06)',
            border: '1px solid rgba(245,197,66,0.2)',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px', animation: 'spin 1.5s linear infinite' }}>🌙</span>
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.9rem',
              color: '#F5C542',
            }}
          >
            {LOADING_MESSAGES[loadingMsgIndex](childName.trim() || 'the story')}
          </span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit || isLoading}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: '12px',
          border: 'none',
          background: canSubmit && !isLoading
            ? 'linear-gradient(135deg, #F5A623 0%, #F5C542 100%)'
            : 'rgba(245,166,35,0.3)',
          color: canSubmit && !isLoading ? '#0D1B2A' : '#B8B0C8',
          fontFamily: 'var(--font-inter)',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: canSubmit && !isLoading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          boxShadow: canSubmit && !isLoading ? '0 4px 20px rgba(245,166,35,0.35)' : 'none',
        }}
      >
        {isLoading ? 'Creating...' : submitLabel}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  )
}
