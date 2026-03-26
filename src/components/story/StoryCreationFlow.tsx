'use client'

import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { StoryForm, type StoryFormValues } from './StoryForm'
import { StoryDisplay } from './StoryDisplay'
import { UpgradeWall } from './UpgradeWall'
import { SavePrompt } from './SavePrompt'
import { StoriesRemainingBadge } from './StoriesRemainingBadge'
import { SignInModal } from '@/components/auth/SignInModal'

const GUEST_COOKIE = 'smt_guest_id'
const COOKIE_MAX_AGE = 604800 // 7 days

function getGuestCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${GUEST_COOKIE}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setGuestCookie(id: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${GUEST_COOKIE}=${encodeURIComponent(id)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`
}

interface StoryResult {
  storyId: string
  storyText: string
  audioUrl: string | null
  imageUrl: string | null
}

interface StoryCreationFlowProps {
  isAuthed: boolean
  userTier?: string
}

export function StoryCreationFlow({ isAuthed, userTier }: StoryCreationFlowProps) {
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [story, setStory] = useState<StoryResult | null>(null)
  const [lastFormValues, setLastFormValues] = useState<StoryFormValues | null>(null)
  const [showUpgradeWall, setShowUpgradeWall] = useState(false)
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [savePromptDismissed, setSavePromptDismissed] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [storiesRemaining, setStoriesRemaining] = useState<number | undefined>(undefined)

  // Initialise guest cookie on mount
  useEffect(() => {
    if (isAuthed) return
    let id = getGuestCookie()
    if (!id) {
      id = nanoid()
      setGuestCookie(id)
    }
    setGuestSessionId(id)
  }, [isAuthed])

  const handleSubmit = async (values: StoryFormValues) => {
    setIsLoading(true)
    setError(null)
    setStory(null)
    setLastFormValues(values)

    try {
      const body: Record<string, unknown> = {
        childName: values.childName,
        childAge: values.childAge,
        prompt: values.prompt,
      }
      if (!isAuthed && guestSessionId) {
        body.guestSessionId = guestSessionId
      }

      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 402) {
        setShowUpgradeWall(true)
        setIsLoading(false)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(
          data.error && typeof data.error === 'string'
            ? data.error
            : 'Something went wrong — please try again in a moment.'
        )
        setIsLoading(false)
        return
      }

      const data = await res.json()
      setStory({
        storyId: data.storyId,
        storyText: data.storyText,
        audioUrl: data.audioUrl ?? null,
        imageUrl: data.imageUrl ?? null,
      })

      // Show save prompt for guests (first story, not dismissed)
      if (!isAuthed && !savePromptDismissed) {
        setShowSavePrompt(true)
      }

      // Refresh remaining count
      await refreshUsage()
    } catch {
      setError('Connection error — check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUsage = async () => {
    try {
      const url = !isAuthed && guestSessionId
        ? `/api/story/usage?guestSessionId=${encodeURIComponent(guestSessionId)}`
        : '/api/story/usage'
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      if (data.limit !== null) {
        setStoriesRemaining(Math.max(0, data.limit - data.used))
      }
    } catch {
      // non-critical
    }
  }

  const handleCreateAnother = () => {
    setStory(null)
    setError(null)
    setLastFormValues(null)
    setShowSavePrompt(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpgradeWallDismiss = () => {
    setShowUpgradeWall(false)
    // Redirect home to show CTA
    window.location.href = '/'
  }

  const handleSavePromptDismiss = () => {
    setShowSavePrompt(false)
    setSavePromptDismissed(true)
  }

  const isPaidUser = userTier === 'monthly' || userTier === 'lifetime'

  return (
    <div>
      {/* Badge for guests/free */}
      {!isPaidUser && (
        <StoriesRemainingBadge guestSessionId={isAuthed ? null : guestSessionId} />
      )}

      {/* Form or Story display */}
      {!story ? (
        <StoryForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <>
          <StoryDisplay
            storyId={story.storyId}
            storyText={story.storyText}
            audioUrl={story.audioUrl}
            imageUrl={story.imageUrl}
            childName={lastFormValues?.childName ?? 'your child'}
            prompt={lastFormValues?.prompt ?? ''}
            storiesRemaining={!isPaidUser ? storiesRemaining : undefined}
            onCreateAnother={handleCreateAnother}
          />
          {showSavePrompt && !isAuthed && (
            <SavePrompt
              onSave={() => setShowSignInModal(true)}
              onDismiss={handleSavePromptDismiss}
            />
          )}
        </>
      )}

      {/* Sign-in modal for save prompt */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        initialTab="signup"
        onSuccess={() => setShowSignInModal(false)}
      />

      {/* Upgrade wall overlay */}
      {showUpgradeWall && (
        <UpgradeWall
          childName={lastFormValues?.childName ?? 'your child'}
          onDismiss={handleUpgradeWallDismiss}
          onSignUp={() => {
            window.location.href = '/auth/signup'
          }}
        />
      )}
    </div>
  )
}
