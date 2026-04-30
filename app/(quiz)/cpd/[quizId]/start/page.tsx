import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Quiz } from '@/lib/db/models/quiz.model'
import { startQuizAttempt } from '@/lib/actions/quizAttempt.actions'
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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function QuizStartPage({ params }: PageProps) {
  await connectToDatabase()
  const { quizId } = await params

  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/quiz/cpd/${quizId}/start`) // CHANGED: CPD-specific callback path.
  }

  const quiz = (await Quiz.findById(quizId)
    .select('_id isPublished')
    .lean()) as QuizStartRow | null

  if (!quiz || !quiz.isPublished) {
    notFound()
  }

  const attempt = await startQuizAttempt({
    quizId: quiz._id.toString(),
    userId: session.user.id,
  })

  redirect(`/quiz/cpd/attempt/${attempt._id.toString()}`) // CHANGED: CPD-specific attempt route.
}
