import Link from 'next/link'
import Menu from './menu'

export default function Header() {
  return (
    <header className='sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur'>
      <div className='mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8'>
        <Link
          href='/'
          className='text-lg font-bold tracking-tight text-slate-900'
        >
          RadPreps
        </Link>
        <Menu />
      </div>
    </header>
  )
}
