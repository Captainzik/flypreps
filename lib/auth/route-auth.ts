import { auth } from '@/auth'
import { AppError } from '@/lib/http/errors'

export async function requireRouteUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new AppError('Unauthorized', {
      statusCode: 401,
      code: 'UNAUTHORIZED',
    })
  }
  return session
}

export async function requireRouteAdmin() {
  const session = await requireRouteUser()
  if (session.user.role !== 'admin') {
    throw new AppError('Forbidden', {
      statusCode: 403,
      code: 'FORBIDDEN',
    })
  }
  return session
}
