'use client'

import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BackHomeButtonProps = {
  className?: string
  label?: string
}

export default function BackHomeButton({
  className,
  label = 'Back to home',
}: BackHomeButtonProps) {
  const router = useRouter()

  return (
    <Button
      type='button'
      variant='outline'
      className={className ?? 'w-full'}
      onClick={() => router.push('/')}
    >
      <Home className='mr-2 h-4 w-4' />
      {label}
    </Button>
  )
}
