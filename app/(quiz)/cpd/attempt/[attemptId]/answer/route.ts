import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { submitAnswerToAttempt } from '@/lib/actions/quizAttempt.submit' // CHANGED: use the corrected submit action path.
import { connectToDatabase } from '@/lib/db'

type RouteContext = {
  params: Promise<{
    attemptId: string
  }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  await connectToDatabase()
  const { attemptId } = await params

  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  const formData = await req.formData()
  const questionId = String(formData.get('questionId') || '')
  const selectedOptionIndexRaw = String(
    formData.get('selectedOptionIndex') || '',
  )
  const selectedOptionIndex = Number(selectedOptionIndexRaw)

  if (!questionId || Number.isNaN(selectedOptionIndex)) {
    return NextResponse.redirect(
      new URL(`/cpd/attempt/${attemptId}`, req.url), // CHANGED: invalid payload falls back to the attempt page.
    )
  }

  await submitAnswerToAttempt({
    attemptId,
    userId: session.user.id,
    questionId,
    selectedOptionIndex,
  })

  return NextResponse.redirect(
    new URL(`/cpd/attempt/${attemptId}`, req.url), // CHANGED: redirect back to the attempt page after saving the answer.
  )
}
