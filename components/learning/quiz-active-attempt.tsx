'use client'

import type { QuizMode } from '@/lib/modes/types' // CHANGED: active attempt shell is mode-aware.
import { QuizAttemptHeader } from '@/components/learning/quiz-attempt-header'
import { QuizQuestionCard } from '@/components/learning/quiz-question-card'

type QuizActiveAttemptProps = {
  attemptId: string // CHANGED: used to build the form action for answer submission.
  mode: QuizMode
  startedAt: Date
  quizName: string
  quizCategory: string
  questionNumber: number
  totalQuestions: number
  question: {
    questionId: string
    questionText: string
    image?: string
    options: {
      text?: string
      image?: string
    }[]
  }
}

export function QuizActiveAttempt({
  attemptId,
  mode,
  startedAt,
  quizName,
  quizCategory,
  questionNumber,
  totalQuestions,
  question,
}: QuizActiveAttemptProps) {
  return (
    <main className='space-y-4 sm:space-y-6'>
      <QuizAttemptHeader
        mode={mode}
        startedAt={startedAt}
        totalQuestions={totalQuestions}
        quizName={quizName}
        quizCategory={quizCategory}
        questionNumber={questionNumber}
        showTimer={mode === 'exam'} // CHANGED: exam-only live timer in the active UI.
      />

      <QuizQuestionCard
        question={question}
        action={`/quiz/attempt/${attemptId}/answer`} // CHANGED: route wrapper now passes the real POST endpoint.
      />
    </main>
  )
}
