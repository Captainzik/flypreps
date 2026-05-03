'use client'

import type { QuizMode } from '@/lib/modes/types'
import { QuizTimingBadge } from '@/components/learning/quiz-timing-badge'

type QuizAttemptHeaderProps = {
  mode: QuizMode
  startedAt: Date
  totalQuestions: number
  quizName: string
  quizCategory: string
  questionNumber: number
  showTimer?: boolean
  onExpire?: () => void // CHANGED: forwarded to QuizTimingBadge.
}

export function QuizAttemptHeader({
  mode,
  startedAt,
  totalQuestions,
  quizName,
  quizCategory,
  questionNumber,
  showTimer = true,
  onExpire,
}: QuizAttemptHeaderProps) {
  return (
    <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-xl font-bold text-slate-900 dark:text-white sm:text-2xl'>
            {quizName}
          </h1>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            {quizCategory}
          </p>
        </div>

        {showTimer ? (
          <QuizTimingBadge
            mode={mode}
            startedAt={startedAt}
            totalQuestions={totalQuestions}
            onExpire={onExpire} // CHANGED: enables timeout auto-submit.
          />
        ) : null}
      </div>

      <div className='mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300'>
        Question {questionNumber} / {totalQuestions}
      </div>
    </section>
  )
}
