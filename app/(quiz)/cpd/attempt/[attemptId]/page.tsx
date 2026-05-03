import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { completeQuizAttempt } from '@/lib/actions/quizAttempt.result'
import { getActiveQuizAttempt } from '@/lib/actions/quizAttempt.active'
import { QuizActiveAttemptShell } from '@/components/learning/quiz-active-attempt-shell'

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
  selectedOptionIndex?: number
}

type ActiveAttempt = {
  _id: { toString(): string }
  mode: 'exam' | 'cpd'
  startedAt: Date
  quiz: {
    name: string
    category: string
  }
  questions: AttemptQuestion[]
  currentQuestionIndex: number // CHANGED: page navigation is now index-driven.
  currentQuestion?: AttemptQuestion // CHANGED: direct question from action, no answered-count logic.
}

export default async function QuizAttemptRunnerPage({ params }: PageProps) {
  const { attemptId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/cpd/attempt/${attemptId}`) // CHANGED: cpd-specific auth callback path.
  }

  const attempt = (await getActiveQuizAttempt({
    attemptId,
    userId: session.user.id,
  })) as ActiveAttempt | null

  if (!attempt) {
    notFound()
  }

  const totalQuestions = attempt.questions.length // CHANGED: total count only; no answered-count logic used.
  const currentQuestion =
    attempt.currentQuestion ?? attempt.questions[attempt.currentQuestionIndex] // CHANGED: direct index-based fallback only.

  if (attempt.currentQuestionIndex >= totalQuestions) {
    await completeQuizAttempt({
      attemptId,
      userId: session.user.id,
    }) // CHANGED: completion boundary uses index only.
    redirect(`/cpd/attempt/${attemptId}/result`) // CHANGED: redirect when index reaches the end boundary.
  }

  if (!currentQuestion) {
    notFound()
  }

  return (
    <QuizActiveAttemptShell
      mode={attempt.mode}
      startedAt={attempt.startedAt}
      quizName={attempt.quiz.name}
      quizCategory={attempt.quiz.category}
      questionNumber={Math.min(
        attempt.currentQuestionIndex + 1,
        totalQuestions,
      )} // CHANGED: display current question number from index.
      totalQuestions={totalQuestions}
      question={currentQuestion}
      action={`/cpd/attempt/${attemptId}/answer`} // CHANGED: cpd-specific answer endpoint.
      showTimer={attempt.mode === 'exam'}
    />
  )
}
