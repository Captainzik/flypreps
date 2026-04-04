'use client'

import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BackHomeButton() {
  const router = useRouter()

  return (
    <Button
      type='button'
      variant='outline'
      className='w-full'
      onClick={() => router.push('/')}
    >
      <Home className='mr-2 h-4 w-4' />
      Back to home
    </Button>
  )
}
