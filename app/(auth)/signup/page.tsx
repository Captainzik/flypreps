'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function SignUpPage() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data?.message || 'Signup failed')
      setLoading(false)
      return
    }

    await signIn('credentials', {
      email: form.email,
      password: form.password,
      callbackUrl: '/',
    })
  }

  return (
    <main className='mx-auto max-w-md p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Create account</h1>
      <form onSubmit={handleSignup} className='space-y-3'>
        <input
          className='w-full rounded border p-2'
          placeholder='Email'
          type='email'
          required
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        />
        <input
          className='w-full rounded border p-2'
          placeholder='Username'
          value={form.username}
          onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
        />
        <input
          className='w-full rounded border p-2'
          placeholder='Full Name'
          value={form.fullName}
          onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
        />
        <input
          className='w-full rounded border p-2'
          placeholder='Password'
          type='password'
          required
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        />
        {error ? <p className='text-sm text-red-600'>{error}</p> : null}
        <button
          className='w-full rounded bg-black p-2 text-white'
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </main>
  )
}
