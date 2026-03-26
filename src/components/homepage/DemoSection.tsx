'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// IMPORTANT: The demo audio at /public/demo-story.mp3 is a placeholder.
// Nissan needs to generate a real demo story using the /api/story/generate endpoint
// once API keys are configured (OPENAI_API_KEY + ELEVENLABS_API_KEY).
// Story params: name=Emma, age=5, theme="The Dragon Who Was Afraid of the Dark"
// Then save the generated MP3 to public/demo-story.mp3

const DEMO_STORY = {
  id: 'demo',
  title: '"The Dragon Who Was Afraid of the Dark"',
  childName: 'Emma',
  childAge: 5,
  excerpt: `Once upon a time, in a cosy little village nestled between two friendly hills,
there lived a small girl named Emma. Emma wasn't afraid of anything — except,
perhaps, the small purple dragon who had moved into the cave at the top of the hill.
What nobody knew — not even Emma yet — was that the dragon was far more afraid of
the dark than Emma had ever been.`,
  audioUrl: '/demo-story.mp3',
  voiceLabel: 'Calm Storyteller voice',
  durationSeconds: 134,
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function AudioPlayer({ audioUrl, durationSeconds, voiceLabel }: {
  audioUrl: string
  durationSeconds: number
  voiceLabel: string
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSeconds)

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
        // Audio may not load in dev without the file — that's fine
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
      className="mt-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '12px',
        padding: '12px 16px',
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Voice label */}
      <p
        className="mb-3 text-xs"
        style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}
      >
        🎙 Narrated in {voiceLabel}
      </p>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleRestart}
          aria-label="Restart story"
          className="text-xl transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          style={{ color: '#F5C542' }}
        >
          ⏮
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause story' : 'Play story'}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          style={{
            background: '#F5A623',
            color: '#0D1B2A',
            fontSize: '18px',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={handleSkip}
          aria-label="Skip 15 seconds"
          className="text-xl transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          style={{ color: '#F5C542' }}
        >
          ⏭
        </button>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Story progress"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            className="flex-1 h-1 appearance-none rounded-full cursor-pointer focus:outline-none"
            style={{
              background: `linear-gradient(to right, #F5C542 ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
              accentColor: '#F5C542',
            }}
          />
          <span
            className="text-xs whitespace-nowrap"
            style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)', minWidth: '72px', textAlign: 'right' }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function DemoSection() {
  const story = DEMO_STORY

  return (
    <section
      className="py-16 md:py-24 px-4 md:px-8"
      style={{ background: '#0D1B2A' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-10">
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 600,
              color: '#F4EFE6',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '12px',
            }}
          >
            See the magic for yourself
          </h2>
          <p style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)', fontSize: '1.125rem' }}>
            Here&apos;s a story we made for Emma, age 5.
          </p>
        </div>

        {/* Story card */}
        <div
          className="rounded-2xl overflow-hidden flex flex-col md:flex-row"
          style={{
            background: '#162032',
            border: '1px solid rgba(245,197,66,0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Illustration placeholder — left on desktop, top on mobile */}
          {/* Replace with real fal.ai generated image once API keys are configured */}
          <div
            className="w-full md:w-80 flex-shrink-0 flex items-center justify-center"
            style={{
              minHeight: '240px',
              background: 'linear-gradient(135deg, #1A2E45 0%, #162032 50%, #0F1E30 100%)',
              borderRight: '1px solid rgba(245,197,66,0.1)',
            }}
            aria-label="Emma and the friendly dragon — an illustrated scene from her personalised story"
          >
            <div className="text-center px-6">
              <div style={{ fontSize: '80px', lineHeight: 1 }}>🐉</div>
              <p className="mt-3 text-xs" style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}>
                Story illustration
              </p>
            </div>
          </div>

          {/* Story content — right */}
          <div className="flex-1 p-6 md:p-8 flex flex-col">
            <h3
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#F4EFE6',
                lineHeight: 1.3,
                marginBottom: '8px',
              }}
            >
              {story.title}
            </h3>
            <p
              className="mb-4 text-sm"
              style={{ color: '#B8B0C8', fontFamily: 'var(--font-inter)' }}
            >
              A personalised story for {story.childName}, age {story.childAge}
            </p>

            {/* Story excerpt with fade-out */}
            <div className="relative flex-1 mb-4 overflow-hidden" style={{ maxHeight: '120px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '1rem',
                  color: '#F4EFE6',
                  lineHeight: 1.65,
                }}
              >
                {story.excerpt}
              </p>
              <div
                className="absolute bottom-0 left-0 right-0 h-12"
                style={{
                  background: 'linear-gradient(to bottom, transparent, #162032)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Audio player */}
            <AudioPlayer
              audioUrl={story.audioUrl}
              durationSeconds={story.durationSeconds}
              voiceLabel={story.voiceLabel}
            />

            {/* CTA */}
            <div className="mt-6">
              <Link
                href="/create"
                className="inline-block transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid rgba(245,197,66,0.5)',
                  color: '#F5C542',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Make a story for your child →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
