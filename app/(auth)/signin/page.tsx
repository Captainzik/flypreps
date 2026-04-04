// app/auth/signin/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/'

  async function handleCredentials(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl,
    })
    setLoading(false)
  }

  return (
    <main className='mx-auto max-w-md p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Sign in</h1>
      <form onSubmit={handleCredentials} className='space-y-3'>
        <input
          className='w-full rounded border p-2'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          required
        />
        <input
          className='w-full rounded border p-2'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
          required
        />
        <button
          className='w-full rounded bg-black p-2 text-white'
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <button
        className='mt-3 w-full rounded border p-2'
        onClick={() => signIn('google', { callbackUrl })}
      >
        Signin with Google
      </button>
    </main>
  )
}
