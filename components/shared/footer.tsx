'use client'

import { ChevronUp } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className='mt-8 bg-black text-white'>
      <Button
        variant='ghost'
        className='w-full rounded-none bg-gray-800 py-5 text-sm hover:bg-gray-700'
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp className='mr-2 h-4 w-4' />
        Back to top
      </Button>

      <div className='container-app py-6'>
        <nav className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm'>
          <Link href='/page/terms-of-use' className='hover:underline'>
            Terms of Use
          </Link>
          <Link href='/page/privacy-policy' className='hover:underline'>
            Privacy Notice
          </Link>
          <Link href='/page/help' className='hover:underline'>
            Help
          </Link>
        </nav>

        <p className='mt-3 text-center text-sm'>© 2026, {APP_NAME}</p>

        <p className='mt-4 text-center text-xs text-gray-400 sm:text-sm'>
          123, Main Street, Anytown, CA, Zip 12345 | +1 (123) 456-7890
        </p>
      </div>
    </footer>
  )
}
