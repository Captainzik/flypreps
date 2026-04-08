'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  userId: string
}

export default function UserRowActions({ userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function deleteUser() {
    const ok = confirm('Delete this user? This action cannot be undone.')
    if (!ok) return

    try {
      setLoading(true)

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      const json = (await res.json()) as { success?: boolean; message?: string }
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed')

      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <Link
        href={`/admin/users/${userId}/edit`}
        className='rounded border px-3 py-1 text-xs'
      >
        Edit
      </Link>
      <button
        onClick={deleteUser}
        disabled={loading}
        className='rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50'
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}
