import { auth, signOut } from '@/auth'
import Link from 'next/link'
import { BookOpenCheck } from 'lucide-react'

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
        href='/blog'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Blog
      </Link>
    </>
  )
}

function LoggedInMenu() {
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

      <Link
        href='/subscription'
        className='header-button rounded-md px-2 py-1.5 text-sm sm:px-3'
      >
        Subscription
      </Link>

      <details className='relative'>
        <summary className='header-button cursor-pointer list-none rounded-md px-2 py-1.5 text-sm sm:px-3'>
          Settings
        </summary>

        <div className='absolute right-0 mt-2 w-52 rounded-md border border-gray-700 bg-black p-1 shadow-lg'>
          <Link
            href='/settings/reset-password'
            className='block rounded px-3 py-2 text-sm hover:bg-gray-800'
          >
            Reset password
          </Link>
          <Link
            href='/settings/reset-data'
            className='block rounded px-3 py-2 text-sm hover:bg-gray-800'
          >
            Reset data
          </Link>
          <Link
            href='/settings/delete-account'
            className='block rounded px-3 py-2 text-sm text-red-400 hover:bg-gray-800'
          >
            Delete account
          </Link>
        </div>
      </details>

      <LogoutButton />
    </>
  )
}

export default async function Menu() {
  const session = await auth()
  const isLoggedIn = Boolean(session?.user?.id)

  return (
    <nav
      aria-label='User quick actions'
      className='ml-auto flex shrink-0 items-center gap-1 sm:gap-2'
    >
      {isLoggedIn ? <LoggedInMenu /> : <LoggedOutMenu />}
    </nav>
  )
}
