'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    session,
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.role === 'admin',
    isModerator: session?.user?.role === 'moderator',
    login: signIn,
    logout: () => signOut({ callbackUrl: '/' }),
  }
}
