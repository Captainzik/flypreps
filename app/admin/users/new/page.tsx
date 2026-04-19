import Link from 'next/link'
import CreateUserForm from '@/components/admin/forms/create-user-form'

export default function NewAdminUserPage() {
  return (
    <main className='space-y-4'>
      <div className='flex items-center justify-between rounded-xl border dark:border-slate-700 dark:bg-slate-800 p-4 shadow-sm'>
        <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>
          Create User
        </h1>
        <Link
          href='/admin/users'
          className='rounded border dark:border-slate-700 dark:bg-slate-800 px-3 py-1 text-sm'
        >
          Back
        </Link>
      </div>

      <CreateUserForm />
    </main>
  )
}
