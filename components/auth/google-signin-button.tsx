'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

type GoogleSignInButtonProps = {
  callbackUrl?: string
  label?: string
}

export default function GoogleSignInButton({
  callbackUrl = '/',
  label = 'Continue with Google',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  async function handleGoogleSignIn(): Promise<void> {
    setLoading(true)
    setError('')

    try {
      // redirect: true (default) lets NextAuth handle navigation
      await signIn('google', { callbackUrl })
    } catch {
      setError('Google sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className='space-y-2'>
      <Button
        type='button'
        variant='outline'
        className='w-full'
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? 'Connecting to Google...' : label}
      </Button>
      {error ? <p className='text-sm text-red-600'>{error}</p> : null}
    </div>
  )
}
