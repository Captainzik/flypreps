import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { completeQuizAttempt } from '@/lib/actions/quizAttempt.result'
import {
  connectToDatabase,
  QuizAttempt,
} from '@/lib/actions/quizAttempt.shared' // CHANGED: shared export is valid and keeps model access consistent.

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
    mode: 'exam', // CHANGED: restrict completion to exam attempts only.
    completed: false,
    status: { $in: ['in_progress', 'paused'] }, // CHANGED: only resumable/in-progress attempts may be completed here.
  }).lean()

  if (!attempt) {
    return NextResponse.json(
      { ok: false, error: 'Attempt not found' },
      { status: 404 },
    )
  }

  await completeQuizAttempt({
    attemptId,
    userId: session.user.id,
  }) // CHANGED: completion is still allowed for timeout or final-question submission flow.

  return NextResponse.json({ ok: true, completed: true }, { status: 200 })
}
