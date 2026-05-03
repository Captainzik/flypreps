import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { startQuizAttempt } from '@/lib/actions/quizAttempt.actions'

type PageProps = {
  params: Promise<{
    quizId: string
  }>
}

export default async function QuizAttemptStartPage({ params }: PageProps) {
  const { quizId } = await params

  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/exam/${quizId}/attempt`) // CHANGED: exam-specific callback path.
  }

  const attempt = await startQuizAttempt({
    quizId,
    userId: session.user.id,
  })

  redirect(`/exam/attempt/${attempt._id.toString()}`) // CHANGED: exam-specific attempt route.
}
