'use client'

import MediaPreview from '@/components/shared/media-preview'
import {
  QUESTION_MEDIA_BOX_CLASS,
  QUESTION_MEDIA_SIZES,
} from '@/lib/constants/media'

type QuizOption = {
  text?: string
  image?: string
}

type QuizOptionListProps = {
  questionId: string
  options: QuizOption[]
}

export function QuizOptionList({ questionId, options }: QuizOptionListProps) {
  return (
    <div className='space-y-3'>
      {options.map((opt, idx) => (
        <label
          key={`${questionId}-${idx}`}
          className='flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 sm:p-4'
        >
          <input
            type='radio'
            name='selectedOptionIndex'
            value={idx}
            required
            className='mt-1 h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-slate-100'
          />

          <div className='min-w-0 flex-1 space-y-2'>
            {opt.text?.trim() ? (
              <span className='block text-sm leading-6 text-slate-800 dark:text-slate-200'>
                {opt.text}
              </span>
            ) : null}

            {opt.image?.trim() ? (
              <div className={QUESTION_MEDIA_BOX_CLASS}>
                <MediaPreview
                  url={opt.image}
                  alt={`Option ${idx + 1} media`}
                  sizes={QUESTION_MEDIA_SIZES}
                />
              </div>
            ) : null}
          </div>
        </label>
      ))}
    </div>
  )
}
