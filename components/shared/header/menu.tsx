import { BookOpenCheck } from 'lucide-react'
import Link from 'next/link'

export default function Menu() {
  return (
    <nav
      aria-label='User quick actions'
      className='ml-auto flex shrink-0 items-center gap-1 sm:gap-2'
    >
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
    </nav>
  )
}
