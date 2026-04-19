import Link from 'next/link'
import Menu from './menu'
import ThemeToggle from './theme-toggle'
import Search from './search'

export default function Header() {
  return (
    <header className='sticky top-0 z-40 border-b   backdrop-blur dark:border-slate-700 dark:bg-slate-950/90'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          <Link
            href='/'
            className='text-lg font-bold tracking-tight text-slate-900 dark:text-white'
          >
            RadPreps
          </Link>

          <div className='ml-auto flex items-center gap-2'>
            <ThemeToggle />
            <Menu />
          </div>
        </div>

        <Search />
      </div>
    </header>
  )
}
