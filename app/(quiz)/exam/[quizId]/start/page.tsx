import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Quiz } from '@/lib/db/models/quiz.model'
import { startQuizAttempt } from '@/lib/actions/quizAttempt.actions'
import { QuizAttempt } from '@/lib/db/models/attempts.model' // CHANGED: needed to detect an existing unfinished attempt before creating a new one.
import { connectToDatabase } from '@/lib/db'

type PageProps = {
  params: Promise<{
    quizId: string
  }>
}

type QuizStartRow = {
  _id: { toString(): string }
  isPublished?: boolean
}

type ExistingAttemptRow = {
  _id: { toString(): string }
  checkpointIndex?: number
  status?: string
} // CHANGED: lightweight shape for reuse checks.

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function QuizStartPage({ params }: PageProps) {
  await connectToDatabase()
  const { quizId } = await params

  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/exam/${quizId}/start`) // CHANGED: exam-specific callback path.
  }

  const quiz = (await Quiz.findById(quizId)
    .select('_id isPublished')
    .lean()) as QuizStartRow | null

  if (!quiz || !quiz.isPublished) {
    notFound()
  }

  const unfinishedAttempt = (await QuizAttempt.findOne({
    user: session.user.id,
    quiz: quiz._id,
    mode: 'exam',
    completed: false,
    status: { $in: ['in_progress', 'paused'] },
  })
    .select('_id checkpointIndex status')
    .lean()) as ExistingAttemptRow | null // CHANGED: check for a paused/in-progress attempt first.

  if (unfinishedAttempt?._id) {
    redirect(`/exam/attempt/${unfinishedAttempt._id.toString()}`) // CHANGED: reuse the unfinished attempt instead of creating a duplicate.
  }

  const attempt = await startQuizAttempt({
    quizId: quiz._id.toString(),
    userId: session.user.id,
    mode: 'exam',
  })

  redirect(`/exam/attempt/${attempt._id.toString()}`) // CHANGED: exam-specific attempt route.
}
