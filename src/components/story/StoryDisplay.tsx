'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface StoryDisplayProps {
  storyId: string
  storyText: string
  audioUrl: string | null
  imageUrl: string | null
  childName: string
  prompt: string
  storiesRemaining?: number
  onCreateAnother: () => void
}

function deriveTitle(childName: string, storyText: string, prompt: string): string {
  // Try to get the first sentence
  const firstSentence = storyText.split(/[.!?]/)[0]?.trim()
  if (firstSentence && firstSentence.length > 10 && firstSentence.length < 80) {
    return `"${firstSentence}"`
  }
  // Fall back to child name + truncated prompt
  const shortPrompt = prompt.length > 40 ? prompt.slice(0, 37) + '...' : prompt
  return `${childName}'s Story: ${shortPrompt}`
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        // ignore
      }
    }
  }

  const handleRestart = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().then(() => setIsPlaying(true)).catch(() => {})
  }

  const handleSkip = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(audio.currentTime + 15, duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const t = Number(e.target.value)
    audio.currentTime = t
    setCurrentTime(t)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginTop: '16px',
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" style={{ display: 'none' }} />
      <p style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)', fontSize: '0.75rem', marginBottom: '10px' }}>
        🎙 Narrated just for your child
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleRestart}
          aria-label="Restart"
          style={{ color: '#F5C542', fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none' }}
        >⏮</button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: '#F5A623',
            color: '#0D1B2A',
            fontSize: '18px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >{isPlaying ? '⏸' : '▶'}</button>
        <button
          onClick={handleSkip}
          aria-label="Skip 15s"
          style={{ color: '#F5C542', fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none' }}
        >⏭</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Story progress"
            style={{
              flex: 1,
              height: '4px',
              appearance: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: `linear-gradient(to right, #F5C542 ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
              accentColor: '#F5C542',
            }}
          />
          <span style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)', fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: '72px', textAlign: 'right' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function StoryDisplay({
  storyId,
  storyText,
  audioUrl,
  imageUrl,
  childName,
  prompt,
  storiesRemaining,
  onCreateAnother,
}: StoryDisplayProps) {
  const [copied, setCopied] = useState(false)
  const title = deriveTitle(childName, storyText, prompt)

  const handleShare = async () => {
    const url = `${window.location.origin}/story/${storyId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  return (
    <div
      style={{
        borderRadius: '20px',
        border: '1px solid rgba(245,197,66,0.15)',
        background: '#162032',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      {/* Illustration */}
      {imageUrl ? (
        <div style={{ position: 'relative', width: '100%', height: '280px' }}>
          <Image
            src={imageUrl}
            alt={`Illustration for ${childName}'s story`}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </div>
      ) : (
        <div
          style={{
            height: '180px',
            background: 'linear-gradient(135deg, #1A2E45 0%, #162032 50%, #0F1E30 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '56px' }}>🌙</div>
          <p style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)', fontSize: '0.8rem' }}>
            Illustration generating...
          </p>
        </div>
      )}

      <div style={{ padding: '24px' }}>
        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.4rem',
            fontWeight: 600,
            color: '#F4EFE6',
            lineHeight: 1.3,
            marginBottom: '6px',
          }}
        >
          {title}
        </h2>
        <p style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)', fontSize: '0.875rem', marginBottom: '20px' }}>
          A personalised story for {childName}
        </p>

        {/* Stories remaining badge */}
        {storiesRemaining !== undefined && storiesRemaining >= 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245,197,66,0.1)',
              border: '1px solid rgba(245,197,66,0.25)',
              borderRadius: '20px',
              padding: '4px 12px',
              marginBottom: '16px',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.8rem',
              color: '#F5C542',
            }}
          >
            ✨ {storiesRemaining === 1 ? 'Last free story' : `${storiesRemaining} free ${storiesRemaining === 1 ? 'story' : 'stories'} left`}
          </div>
        )}

        {/* Story text */}
        <div
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1rem',
            color: '#F4EFE6',
            lineHeight: 1.8,
            maxWidth: '65ch',
            marginBottom: '16px',
            whiteSpace: 'pre-line',
          }}
        >
          {storyText}
        </div>

        {/* Audio player */}
        {audioUrl && <AudioPlayer audioUrl={audioUrl} />}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={handleShare}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1.5px solid rgba(245,197,66,0.3)',
              background: 'transparent',
              color: '#F5C542',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {copied ? '✅ Copied!' : '🔗 Share Story'}
          </button>
          <button
            onClick={onCreateAnother}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #F5A623 0%, #F5C542 100%)',
              color: '#0D1B2A',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            ✨ Create Another Story
          </button>
        </div>
      </div>
    </div>
  )
}
