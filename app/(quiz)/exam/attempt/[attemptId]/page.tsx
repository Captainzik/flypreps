import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  getActiveQuizAttempt,
  completeQuizAttempt,
} from '@/lib/actions/quizAttempt.actions'
import { QuizActiveAttempt } from '@/components/learning/quiz-active-attempt'

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
    redirect(`/signin?callbackUrl=/quiz/exam/attempt/${attemptId}`) // CHANGED: exam-specific auth callback path.
  }

  const attempt = (await getActiveQuizAttempt({
    attemptId,
    userId: session.user.id,
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
    })
    redirect(`/quiz/exam/attempt/${attemptId}/result`) // CHANGED: exam-specific completed-attempt redirect.
  }

  const currentQuestion = attempt.questions[answeredCount]

  if (!currentQuestion) {
    notFound()
  }

  return (
    <QuizActiveAttempt
      attemptId={attemptId}
      mode={attempt.mode}
      startedAt={attempt.startedAt}
      quizName={attempt.quiz.name}
      quizCategory={attempt.quiz.category}
      questionNumber={answeredCount + 1}
      totalQuestions={attempt.questions.length}
      question={currentQuestion}
    />
  )
}
