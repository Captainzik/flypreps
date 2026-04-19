import { requireAdmin } from '@/lib/auth/guards'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()

  return (
    <div className='min-h-screen dark:bg-slate-950'>
      <div className='mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8'>
        <div className='mb-6 rounded-xl border  dark:border-slate-700 dark:bg-slate-800 p-4 shadow-sm'>
          <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>
            Admin Panel
          </h1>
          <p className='text-sm text-slate-600 dark:text-slate-400'>
            Restricted area. Signed in as {session.user.email}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
