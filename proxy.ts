import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')

  if (!req.auth && isAdminRoute) {
    const signInUrl = new URL('/auth/signin', req.nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(signInUrl)
  }

  if (isAdminRoute && req.auth?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/403', req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
