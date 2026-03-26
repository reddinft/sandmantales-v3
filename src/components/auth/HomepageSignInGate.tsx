'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignInModal } from './SignInModal'

interface HomepageSignInGateProps {
  autoOpen?: boolean
}

export function HomepageSignInGate({ autoOpen = false }: HomepageSignInGateProps) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const router = useRouter()

  // Open if autoOpen prop arrives (e.g. server rendered with ?signin=true)
  useEffect(() => {
    if (autoOpen) setIsOpen(true)
  }, [autoOpen])

  const handleClose = () => {
    setIsOpen(false)
    // Clean up the URL param without a hard reload
    const url = new URL(window.location.href)
    url.searchParams.delete('signin')
    router.replace(url.pathname + (url.search || ''))
  }

  const handleSuccess = () => {
    router.push('/account')
  }

  return (
    <SignInModal
      isOpen={isOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
      initialTab="signin"
    />
  )
}
