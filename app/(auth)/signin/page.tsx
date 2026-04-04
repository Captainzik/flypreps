'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import GoogleSignInButton from '@/components/auth/google-signin-button'
import BackHomeButton from '@/components/auth/back-home-button'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/'

  async function handleCredentials(
    e: React.SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setLoading(false)

    if (!res) {
      setError('Sign in failed. Please try again.')
      return
    }

    if (res.error) {
      setError('Invalid email or password.')
      return
    }

    window.location.href = res.url ?? callbackUrl
  }

  return (
    <main className='mx-auto w-full max-w-md px-4 py-8 sm:py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Sign in</h1>

      <form onSubmit={handleCredentials} className='space-y-3'>
        <input
          className='w-full rounded border p-2'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          autoComplete='email'
          required
        />
        <input
          className='w-full rounded border p-2'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
          autoComplete='current-password'
          required
        />

        {error ? <p className='text-sm text-red-600'>{error}</p> : null}

        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className='my-5 flex items-center gap-3'>
        <div className='h-px flex-1 bg-border' />
        <span className='text-xs text-muted-foreground'>OR</span>
        <div className='h-px flex-1 bg-border' />
      </div>

      <GoogleSignInButton />

      <div className='mt-4'>
        <BackHomeButton />
      </div>

      <div className='mt-6 rounded-lg border p-4 text-center'>
        <p className='text-sm text-muted-foreground'>Don’t have an account?</p>
        <Button asChild className='mt-3 w-full' type='button'>
          <Link href='/signup'>Create account</Link>
        </Button>
      </div>
    </main>
  )
}
