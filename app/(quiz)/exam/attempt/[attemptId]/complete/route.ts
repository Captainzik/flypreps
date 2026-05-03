import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { completeQuizAttempt } from '@/lib/actions/quizAttempt.result'
import { connectToDatabase } from '@/lib/db'
import { QuizAttempt } from '@/lib/actions/quizAttempt.shared'

type RouteContext = {
  params: Promise<{
    attemptId: string
  }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  await connectToDatabase()

  const session = await auth()
  const { attemptId } = await params

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    user: session.user.id,
  }).lean()

  if (!attempt) {
    return NextResponse.json(
      { ok: false, error: 'Attempt not found' },
      { status: 404 },
    )
  }

  if (attempt.completed) {
    return NextResponse.json({ ok: true, completed: true }, { status: 200 })
  }

  await completeQuizAttempt({
    attemptId,
    userId: session.user.id,
  })

  return NextResponse.json({ ok: true, completed: true }, { status: 200 })
}
