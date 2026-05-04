import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getActiveQuizAttempt } from '@/lib/actions/quizAttempt.active'
import { completeQuizAttempt } from '@/lib/actions/quizAttempt.result'
import { QuizExamAttemptClient } from '@/components/learning/quiz-exam-attempt-client'

type PageProps = {
  params: Promise<{
    attemptId: string
  }>
}

type AttemptQuestion = {
  questionId: string
  questionText: string
  image?: string
  options: {
    text?: string
    image?: string
  }[]
}

type ActiveAttempt = {
  _id: { toString(): string }
  mode: 'exam' | 'cpd'
  startedAt: Date
  checkpointIndex?: number // CHANGED: resume should be driven by the persisted checkpoint boundary.
  quiz: {
    name: string
    category: string
  }
  answers: {
    questionId: string
    selectedOptionIndex?: number
  }[]
  questions: AttemptQuestion[]
}

export default async function QuizAttemptRunnerPage({ params }: PageProps) {
  const { attemptId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/exam/attempt/${attemptId}`) // CHANGED: exam-specific auth callback.
  }

  const attempt = (await getActiveQuizAttempt({
    attemptId,
    userId: session.user.id,
    expectedMode: 'exam',
  })) as ActiveAttempt | null

  if (!attempt) {
    notFound()
  }

  const answeredCount = attempt.answers.filter(
    (a) => typeof a.selectedOptionIndex === 'number',
  ).length

  if (answeredCount >= attempt.questions.length) {
    await completeQuizAttempt({
      attemptId,
      userId: session.user.id,
    }) // CHANGED: finalize the attempt before redirecting to results.
    redirect(`/exam/attempt/${attemptId}/result`)
  }

  const resumeIndex = Math.max(
    0,
    Math.min(
      attempt.questions.length - 1,
      typeof attempt.checkpointIndex === 'number' ? attempt.checkpointIndex : 0,
    ),
  ) // CHANGED: resume from the saved checkpoint boundary, not from answeredCount.

  const currentQuestion =
    attempt.questions[resumeIndex] ?? attempt.questions[answeredCount]

  if (!currentQuestion) {
    notFound()
  }

  const currentQuestionNumber = resumeIndex + 1 // CHANGED: display stays synchronized with the resumed question position.

  return (
    <QuizExamAttemptClient
      attemptId={attemptId}
      mode={attempt.mode}
      startedAt={
        attempt.startedAt instanceof Date
          ? attempt.startedAt.toISOString()
          : new Date(attempt.startedAt).toISOString()
      } // CHANGED: serializable ISO string keeps client timer synchronous with backend start time.
      quizName={attempt.quiz.name}
      quizCategory={attempt.quiz.category}
      questionNumber={currentQuestionNumber}
      totalQuestions={attempt.questions.length}
      question={currentQuestion}
      action={`/exam/attempt/${attemptId}/answer`} // CHANGED: exam-specific answer endpoint.
    />
  )
}
