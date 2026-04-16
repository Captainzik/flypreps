import Link from 'next/link'
import { Types } from 'mongoose'
import { User } from '@/lib/db/models/user.model'
import UserRoleForm from '@/components/admin/actions/user-role-form'
import UserRowActions from '@/components/admin/actions/user-row-actions'
import { connectToDatabase } from '@/lib/db'

type UserRole = 'user' | 'admin' | 'moderator'

type UserRow = {
  _id: Types.ObjectId
  email: string
  username?: string
  role: UserRole
  isVerified: boolean
}

export default async function AdminUsersPage() {
  await connectToDatabase()
  const users = (await User.find({})
    .sort({ createdAt: -1 })
    .select('email username role isVerified')
    .lean()) as UserRow[]

  return (
    <main className='space-y-4'>
      <div className='flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm'>
        <h1 className='text-xl font-semibold'>Manage Users</h1>
        <Link
          href='/admin/users/new'
          className='rounded-lg bg-slate-900 px-4 py-2 text-sm text-white'
        >
          + New User
        </Link>
      </div>

      <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
        <table className='w-full text-sm'>
          <thead className='bg-slate-50 text-left'>
            <tr>
              <th className='p-3'>Email</th>
              <th className='p-3'>Username</th>
              <th className='p-3'>Role</th>
              <th className='p-3'>Verified</th>
              <th className='p-3'>Role Action</th>
              <th className='p-3'>CRUD Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id.toString()} className='border-t'>
                <td className='p-3'>{u.email}</td>
                <td className='p-3'>{u.username ?? '—'}</td>
                <td className='p-3'>{u.role}</td>
                <td className='p-3'>{u.isVerified ? 'Yes' : 'No'}</td>
                <td className='p-3'>
                  <UserRoleForm
                    userId={u._id.toString()}
                    initialRole={u.role}
                  />
                </td>
                <td className='p-3'>
                  <UserRowActions userId={u._id.toString()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
