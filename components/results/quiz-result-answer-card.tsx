'use client'

import MediaPreview from '@/components/shared/media-preview'
import { QuizResultOption } from '@/components/results/quiz-result-option'

type ResultAnswer = {
  questionId: string
  questionText: string
  questionImage?: string
  selectedOptionIndex?: number
  correctOptionIndex: number
  isCorrect: boolean
  pointsEarned: number
  tips?: string
  options: { text?: string; image?: string }[]
}

const MEDIA_BOX =
  'relative mt-3 h-48 w-full max-w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700'

type QuizResultAnswerCardProps = {
  answer: ResultAnswer
  index: number
  attemptId: string
}

export function QuizResultAnswerCard({
  answer,
  index,
  attemptId,
}: QuizResultAnswerCardProps) {
  const userOption =
    typeof answer.selectedOptionIndex === 'number'
      ? answer.options[answer.selectedOptionIndex]
      : undefined

  const correctOption =
    answer.correctOptionIndex >= 0
      ? answer.options[answer.correctOptionIndex]
      : undefined

  return (
    <article className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5'>
      <div className='mb-2 flex items-center justify-between gap-3'>
        <p className='text-sm font-semibold text-slate-900 dark:text-white'>
          Q{index + 1}. {answer.questionText}
        </p>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            answer.isCorrect
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
          }`}
        >
          {answer.isCorrect ? 'Correct' : 'Incorrect'}
        </span>
      </div>

      {answer.questionImage?.trim() ? (
        <div className={MEDIA_BOX}>
          <MediaPreview
            url={answer.questionImage}
            alt={`Question ${index + 1} media`}
          />
        </div>
      ) : null}

      <div className='mt-2 text-sm text-slate-700 dark:text-slate-300'>
        <span className='font-medium'>Your answer:</span>
        <div className='mt-1'>
          <QuizResultOption
            option={userOption}
            alt='Your selected option media'
          />
        </div>
      </div>

      <div className='mt-2 text-sm text-slate-700 dark:text-slate-300'>
        <span className='font-medium'>Correct answer:</span>
        <div className='mt-1'>
          <QuizResultOption option={correctOption} alt='Correct option media' />
        </div>
      </div>

      {answer.tips ? (
        <p className='mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-50 dark:text-amber-800'>
          Tip: {answer.tips}
        </p>
      ) : null}
    </article>
  )
}
