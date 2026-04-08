import Link from 'next/link'

export default function NewAdminUserPage() {
  return (
    <main className='space-y-4'>
      <div className='flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm'>
        <h1 className='text-xl font-semibold'>Create User</h1>
        <Link href='/admin/users' className='rounded border px-3 py-1 text-sm'>
          Back
        </Link>
      </div>

      <form
        action='/api/admin/users'
        method='post'
        className='space-y-3 rounded-xl border bg-white p-4 shadow-sm'
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const payload = {
            email: (form.elements.namedItem('email') as HTMLInputElement).value,
            username: (form.elements.namedItem('username') as HTMLInputElement)
              .value,
            fullName: (form.elements.namedItem('fullName') as HTMLInputElement)
              .value,
            password: (form.elements.namedItem('password') as HTMLInputElement)
              .value,
            avatar: (form.elements.namedItem('avatar') as HTMLInputElement)
              .value,
            role: (form.elements.namedItem('role') as HTMLSelectElement).value,
            isVerified: (
              form.elements.namedItem('isVerified') as HTMLInputElement
            ).checked,
          }

          fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(async (res) => {
              const json = (await res.json()) as {
                success?: boolean
                message?: string
              }
              if (!res.ok || !json.success)
                throw new Error(json.message || 'Failed to create user')
              window.location.href = '/admin/users'
            })
            .catch((err: unknown) => {
              alert(
                err instanceof Error ? err.message : 'Failed to create user',
              )
            })
        }}
      >
        <input
          name='email'
          type='email'
          required
          placeholder='Email'
          className='w-full rounded border px-3 py-2'
        />
        <input
          name='username'
          placeholder='Username (optional)'
          className='w-full rounded border px-3 py-2'
        />
        <input
          name='fullName'
          placeholder='Full name (optional)'
          className='w-full rounded border px-3 py-2'
        />
        <input
          name='password'
          type='password'
          required
          minLength={8}
          placeholder='Password'
          className='w-full rounded border px-3 py-2'
        />
        <input
          name='avatar'
          placeholder='Avatar URL (optional)'
          className='w-full rounded border px-3 py-2'
        />

        <div className='flex items-center gap-3'>
          <select name='role' className='rounded border px-3 py-2'>
            <option value='user'>user</option>
            <option value='moderator'>moderator</option>
            <option value='admin'>admin</option>
          </select>

          <label className='flex items-center gap-2 text-sm'>
            <input name='isVerified' type='checkbox' defaultChecked />
            Verified
          </label>
        </div>

        <button className='rounded bg-slate-900 px-4 py-2 text-sm text-white'>
          Create User
        </button>
      </form>
    </main>
  )
}
