'use client'

import type { QuizMode } from '@/lib/modes/types' // CHANGED: component is aware of exam vs CPD.
import { Clock } from 'lucide-react'
import {
  getCompletionSummaryTimeLabel,
  getExamTimerLabel,
} from '@/lib/ui/quiz-timing'

type QuizTimingBadgeProps = {
  mode: QuizMode
  startedAt: Date
  totalQuestions: number
  completedAt?: Date
  timeTakenMs?: number
  showCompletedTime?: boolean
}

export function QuizTimingBadge({
  mode,
  startedAt,
  totalQuestions,
  completedAt,
  timeTakenMs,
  showCompletedTime = false,
}: QuizTimingBadgeProps) {
  const examLabel = getExamTimerLabel({
    mode,
    startedAt,
    totalQuestions,
  })

  const completedLabel = getCompletionSummaryTimeLabel({
    mode,
    startedAt,
    completedAt,
    timeTakenMs,
  })

  const label = showCompletedTime ? completedLabel : examLabel

  if (!label) return null

  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'>
      <Clock className='h-4 w-4 text-slate-500 dark:text-slate-400' />
      <span className='font-medium'>{label}</span>
    </div>
  )
}
