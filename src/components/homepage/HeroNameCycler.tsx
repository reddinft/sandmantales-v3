'use client'

import { useState, useEffect } from 'react'

interface HeroNameCyclerProps {
  names: string[]
  durationMs: number
}

export function HeroNameCycler({ names, durationMs }: HeroNameCyclerProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % names.length)
        setVisible(true)
      }, 300)
    }, durationMs)

    return () => clearInterval(interval)
  }, [names, durationMs])

  return (
    <span
      suppressHydrationWarning
      className="text-gold font-bold"
      style={{
        display: 'inline-block',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
      }}
    >
      {names[index]}
    </span>
  )
}
