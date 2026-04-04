import { APP_NAME } from '@/lib/constants'
import Image from 'next/image'
import Link from 'next/link'
import { MenuIcon } from 'lucide-react'
import data from '@/lib/data'
import Search from './search'
import Menu from './menu'

export default function Header() {
  return (
    <header className='sticky top-0 z-40 bg-black text-white shadow-sm'>
      <div className='container-app'>
        {/* Top row */}
        <div className='flex min-h-14 items-center gap-3 py-2'>
          <Link
            href='/'
            className='header-button flex shrink-0 items-center gap-2 rounded-md px-2 py-1 font-extrabold text-lg sm:text-xl'
            aria-label={`${APP_NAME} home`}
          >
            <Image
              src='/icons/logo.svg'
              width={36}
              height={36}
              alt={`${APP_NAME} logo`}
              className='h-8 w-8 sm:h-9 sm:w-9'
            />
            <span className='truncate'>{APP_NAME}</span>
          </Link>

          <div className='hidden flex-1 md:block'>
            <Search />
          </div>

          <Menu />
        </div>

        {/* Mobile search row */}
        <div className='pb-2 md:hidden'>
          <Search />
        </div>
      </div>

      {/* Secondary nav row */}
      <div className='bg-gray-800/95'>
        <div className='container-app flex items-center gap-2 py-2'>
          <button
            type='button'
            className='header-button flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm'
            aria-label='Browse all categories'
          >
            <MenuIcon className='h-4 w-4' />
            <span>All</span>
          </button>

          <nav
            aria-label='Primary'
            className='no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap'
          >
            {data.headerMenus.map((menu) => (
              <Link
                href={menu.href}
                key={menu.href}
                className='header-button rounded-md px-2 py-1.5 text-sm'
              >
                {menu.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
