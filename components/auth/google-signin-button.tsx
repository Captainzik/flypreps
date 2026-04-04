'use client'

import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'

export default function GoogleSignInButton() {
  return (
    <Button
      type='button'
      variant='outline'
      className='w-full'
      onClick={() => signIn('google', { callbackUrl: '/' })}
    >
      Continue with Google
    </Button>
  )
}
