'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MoonStar, SunMedium } from 'lucide-react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  if (!mounted) {
    return (
      <button
        type='button'
        aria-label='Theme toggle'
        className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
      >
        <span className='sr-only'>Loading theme toggle</span>
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type='button'
      aria-label='Toggle dark mode'
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
    >
      {isDark ? (
        <SunMedium className='h-5 w-5' />
      ) : (
        <MoonStar className='h-5 w-5' />
      )}
    </button>
  )
}
