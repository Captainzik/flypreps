'use client'

import MediaPreview from '@/components/shared/media-preview'

type QuizResultOptionProps = {
  option?: {
    text?: string
    image?: string
  }
  alt?: string
}

const MEDIA_BOX =
  'relative mt-2 h-48 w-full max-w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700'

export function QuizResultOption({
  option,
  alt = 'Option',
}: QuizResultOptionProps) {
  if (!option) return <span>N/A</span>

  return (
    <div className='space-y-2'>
      {option.text?.trim() ? <p className='leading-6'>{option.text}</p> : null}
      {option.image?.trim() ? (
        <div className={MEDIA_BOX}>
          <MediaPreview url={option.image} alt={alt} />
        </div>
      ) : null}
      {!option.text?.trim() && !option.image?.trim() ? <span>N/A</span> : null}
    </div>
  )
}
