'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'

export default function SignOutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      style={{
        display: 'inline-block',
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(239,68,68,0.3)',
        background: 'transparent',
        color: '#FCA5A5',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        fontFamily: 'var(--font-inter)',
      }}
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
