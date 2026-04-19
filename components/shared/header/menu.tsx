import { auth, signOut } from '@/auth'
import Link from 'next/link'
import { BookOpenCheck } from 'lucide-react'

type AppSession = {
  user?: {
    id?: string | null
    role?: string | null
  } | null
} | null

async function LogoutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/' })
      }}
    >
      <button
        type='submit'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Logout
      </button>
    </form>
  )
}

function LoggedOutMenu() {
  return (
    <>
      <Link
        href='/signin'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Sign in
      </Link>
      <Link
        href='/quiz'
        className='header-button flex items-center gap-1 rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        <BookOpenCheck className='h-4 w-4 sm:h-5 sm:w-5' />
        <span>Quiz</span>
      </Link>
      <Link
        href='/feed'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Feed
      </Link>
      <Link
        href='/blog'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Blog
      </Link>
    </>
  )
}

function LoggedInMenu({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <Link
        href='/quiz'
        className='header-button flex items-center gap-1 rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        <BookOpenCheck className='h-4 w-4 sm:h-5 sm:w-5' />
        <span>Quiz</span>
      </Link>
      <Link
        href='/quiz/history'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Stats
      </Link>
      <Link
        href='/leaderboard'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Leaderboard
      </Link>
      {/**<Link
        href='/subscription'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Subscription
      </Link>*/}
      <Link
        href='/feed'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Feed
      </Link>
      <Link
        href='/profile'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Profile
      </Link>
      {isAdmin ? (
        <Link
          href='/admin'
          className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
        >
          Admin
        </Link>
      ) : null}
      <LogoutButton />
    </>
  )
}

export default async function Menu() {
  const session = (await auth()) as AppSession
  const isLoggedIn = Boolean(session?.user?.id)
  const isAdmin = session?.user?.role === 'admin'

  return (
    <nav
      aria-label='Primary navigation'
      className='ml-auto flex shrink-0 flex-wrap items-center gap-1 sm:gap-2'
    >
      {isLoggedIn ? <LoggedInMenu isAdmin={isAdmin} /> : <LoggedOutMenu />}
    </nav>
  )
}
