import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from '@/lib/constants'
import AuthSessionProvider from '@/components/providers/session-provider'
import ToasterProvider from '@/components/providers/toaster-provider'
import Header from '@/components/shared/header'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `${APP_NAME}: ${APP_SLOGAN}`,
  },
  description: APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        <AuthSessionProvider>
          <div className='min-h-screen'>
            <Header />
            <main className='mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
              {children}
            </main>
          </div>
          <ToasterProvider />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
