import Link from 'next/link'
import { User } from '@/lib/db/models/user.model'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditAdminUserPage({ params }: Props) {
  const { id } = await params

  const user = await User.findById(id)
    .select('_id email username fullName avatar role isVerified')
    .lean()

  if (!user) {
    return (
      <main className='space-y-4'>
        <p className='rounded-xl border bg-white p-4 shadow-sm'>
          User not found.
        </p>
      </main>
    )
  }

  return (
    <main className='space-y-4'>
      <div className='flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm'>
        <h1 className='text-xl font-semibold'>Edit User</h1>
        <Link href='/admin/users' className='rounded border px-3 py-1 text-sm'>
          Back
        </Link>
      </div>

      <form
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
            avatar: (form.elements.namedItem('avatar') as HTMLInputElement)
              .value,
            role: (form.elements.namedItem('role') as HTMLSelectElement).value,
            isVerified: (
              form.elements.namedItem('isVerified') as HTMLInputElement
            ).checked,
            password: (form.elements.namedItem('password') as HTMLInputElement)
              .value,
          }

          const body = {
            ...payload,
            password: payload.password || undefined,
          }

          fetch(`/api/admin/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
            .then(async (res) => {
              const json = (await res.json()) as {
                success?: boolean
                message?: string
              }
              if (!res.ok || !json.success)
                throw new Error(json.message || 'Failed to update user')
              window.location.href = '/admin/users'
            })
            .catch((err: unknown) => {
              alert(
                err instanceof Error ? err.message : 'Failed to update user',
              )
            })
        }}
      >
        <input
          name='email'
          type='email'
          required
          defaultValue={user.email}
          className='w-full rounded border px-3 py-2'
        />
        <input
          name='username'
          defaultValue={user.username ?? ''}
          className='w-full rounded border px-3 py-2'
        />
        <input
          name='fullName'
          defaultValue={user.fullName ?? ''}
          className='w-full rounded border px-3 py-2'
        />
        <input
          name='avatar'
          defaultValue={user.avatar ?? ''}
          className='w-full rounded border px-3 py-2'
        />

        <div className='flex items-center gap-3'>
          <select
            name='role'
            defaultValue={user.role}
            className='rounded border px-3 py-2'
          >
            <option value='user'>user</option>
            <option value='moderator'>moderator</option>
            <option value='admin'>admin</option>
          </select>

          <label className='flex items-center gap-2 text-sm'>
            <input
              name='isVerified'
              type='checkbox'
              defaultChecked={user.isVerified}
            />
            Verified
          </label>
        </div>

        <input
          name='password'
          type='password'
          minLength={8}
          placeholder='New password (optional)'
          className='w-full rounded border px-3 py-2'
        />

        <button className='rounded bg-slate-900 px-4 py-2 text-sm text-white'>
          Save Changes
        </button>
      </form>
    </main>
  )
}
