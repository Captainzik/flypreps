import Link from 'next/link'
import { Button } from '@/components/ui/button'
import GoogleSignInButton from '@/components/auth/google-signin-button'
import BackHomeButton from '@/components/auth/back-home-button'

export default function SignInPage() {
  return (
    <main className='mx-auto w-full max-w-md px-4 py-10'>
      <h1 className='mb-6 text-2xl font-bold'>Sign in</h1>

      <form className='space-y-4'>
        <div>
          <label htmlFor='email' className='mb-1 block text-sm font-medium'>
            Email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            required
            className='w-full rounded-md border px-3 py-2'
            placeholder='you@example.com'
          />
        </div>

        <div>
          <label htmlFor='password' className='mb-1 block text-sm font-medium'>
            Password
          </label>
          <input
            id='password'
            name='password'
            type='password'
            required
            className='w-full rounded-md border px-3 py-2'
            placeholder='••••••••'
          />
        </div>

        <Button type='submit' className='w-full'>
          Sign in
        </Button>
      </form>

      <div className='my-5 flex items-center gap-3'>
        <div className='h-px flex-1 bg-border' />
        <span className='text-xs text-muted-foreground'>OR</span>
        <div className='h-px flex-1 bg-border' />
      </div>

      <div className='space-y-3'>
        <GoogleSignInButton />
        <BackHomeButton />
      </div>

      <div className='mt-6 rounded-lg border p-4 text-center'>
        <p className='text-sm text-muted-foreground'>Don’t have an account?</p>
        <Link
          href='/signup'
          className='mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
        >
          Create account
        </Link>
      </div>
    </main>
  )
}
