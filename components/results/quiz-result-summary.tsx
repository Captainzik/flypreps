'use client'

import type { QuizMode } from '@/lib/modes/types' // CHANGED: summary is mode-aware.
import { getCompletionSummaryTimeLabel } from '@/lib/ui/quiz-timing'
import { formatDuration } from '@/lib/learning/timing'
import { BadgeCheck, Clock3, Trophy, TimerReset } from 'lucide-react'

type QuizResultSummaryProps = {
  mode: QuizMode
  score: number
  maxScore: number
  percentage: number
  startedAt: Date
  completedAt?: Date
  timeTakenMs?: number
  totalQuestions?: number
  timedOut?: boolean
  forceCompletedByTimeout?: boolean
}

export function QuizResultSummary({
  mode,
  score,
  maxScore,
  percentage,
  startedAt,
  completedAt,
  timeTakenMs,
  totalQuestions,
  timedOut,
  forceCompletedByTimeout,
}: QuizResultSummaryProps) {
  const completionTime = getCompletionSummaryTimeLabel({
    mode,
    startedAt,
    completedAt,
    timeTakenMs,
  })

  const displayTime =
    completionTime ??
    (completedAt
      ? formatDuration(completedAt.getTime() - startedAt.getTime())
      : undefined)

  const isExam = mode === 'exam'
  const finalPercentage = Math.max(0, Math.min(100, percentage))

  return (
    <section className='w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-2'>
          <div className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200'>
            {isExam ? (
              <>
                <TimerReset className='h-4 w-4' />
                Exam summary
              </>
            ) : (
              <>
                <BadgeCheck className='h-4 w-4' />
                CPD summary
              </>
            )}
          </div>

          <h2 className='text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl'>
            {isExam ? 'Exam completed' : 'CPD session completed'}
          </h2>

          <p className='max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base'>
            {isExam
              ? 'Your exam result is now finalized. Review your performance and continue to your next checkpoint or next attempt.'
              : 'Your CPD result is ready. Time spent, score, and completion feedback are shown below.'}
          </p>
        </div>

        <div className='grid grid-cols-2 gap-3 sm:min-w-[18rem]'>
          <div className='rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800'>
            <div className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>
              Score
            </div>
            <div className='mt-1 text-lg font-semibold text-slate-900 dark:text-white'>
              {score}/{maxScore}
            </div>
          </div>

          <div className='rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800'>
            <div className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>
              Accuracy
            </div>
            <div className='mt-1 text-lg font-semibold text-slate-900 dark:text-white'>
              {finalPercentage.toFixed(1)}%
            </div>
          </div>

          <div className='rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800'>
            <div className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>
              Time
            </div>
            <div className='mt-1 text-lg font-semibold text-slate-900 dark:text-white'>
              {displayTime ?? '—'}
            </div>
          </div>

          <div className='rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800'>
            <div className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>
              Questions
            </div>
            <div className='mt-1 text-lg font-semibold text-slate-900 dark:text-white'>
              {typeof totalQuestions === 'number' ? totalQuestions : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className='mt-5 grid gap-3 sm:grid-cols-3'>
        <div className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
          <div className='flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
            <Trophy className='h-4 w-4 text-amber-500' />
            Performance
          </div>
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>
            {finalPercentage >= 90
              ? 'Excellent performance.'
              : finalPercentage >= 80
                ? 'Strong performance.'
                : finalPercentage >= 50
                  ? 'Good progress.'
                  : 'Keep practicing to improve.'}
          </p>
        </div>

        <div className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
          <div className='flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
            <Clock3 className='h-4 w-4 text-sky-500' />
            Timing
          </div>
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>
            {isExam
              ? timedOut || forceCompletedByTimeout
                ? 'Exam time expired and the result was finalized automatically.'
                : 'Exam timer was applied during the session.'
              : 'CPD time is shown only after completion.'}
          </p>
        </div>

        <div className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
          <div className='flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
            <BadgeCheck className='h-4 w-4 text-emerald-500' />
            Feedback
          </div>
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>
            {isExam
              ? 'Review your exam carefully and continue improving your timing.'
              : 'Use CPD feedback to reinforce learning and build consistency.'}
          </p>
        </div>
      </div>
    </section>
  )
}
