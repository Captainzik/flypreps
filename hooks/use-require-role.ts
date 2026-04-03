'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'

export function useRequireRole(roles: Array<'user' | 'admin' | 'moderator'>) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/auth/signin')
      return
    }
    if (!roles.includes(user.role)) {
      router.replace('/403')
    }
  }, [isLoading, user, roles, router])

  return { user, isLoading }
}
