import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/db/models/user.model'
import UpdateProfileClient from './update-profile-client'

type UserProfileRow = {
  email?: string
  username?: string
  fullName?: string
  avatar?: string
}

export default async function UpdateProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/signin?callbackUrl=/profile/update')
  }

  await connectToDatabase()

  const user = (await User.findById(session.user.id)
    .select('email username fullName avatar')
    .lean()) as UserProfileRow | null

  if (!user) {
    redirect('/signin')
  }

  return (
    <UpdateProfileClient
      userId={session.user.id}
      initialEmail={user.email ?? ''}
      initialUsername={user.username ?? ''}
      initialFullName={user.fullName ?? ''}
      initialAvatar={user.avatar ?? ''}
    />
  )
}
