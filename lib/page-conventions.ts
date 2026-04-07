import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'

export async function requirePageUser(callbackUrl: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }
  return session
}

export async function pageBootstrap(callbackUrl: string) {
  const session = await requirePageUser(callbackUrl)
  await connectToDatabase()
  return session
}
