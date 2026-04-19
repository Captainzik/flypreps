'use client'

import { useEffect, useState, SubmitEvent } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  quizId: string
  userId: string
}

type ReviewState = {
  hasReviewed: boolean
  review: {
    _id: string
    rating: number
    title: string
    comment: string
    createdAt?: string | Date
  } | null
}

type ReviewApiResponse =
  | ReviewState
  | {
      success: boolean
      data?: unknown
      message?: string
    }

export default function QuizReviewForm({ quizId, userId }: Props) {
  const router = useRouter()

  const [rating, setRating] = useState<number>(5)
  const [title, setTitle] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reviewState, setReviewState] = useState<ReviewState | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadReviewState() {
      try {
        setChecking(true)
        const res = await fetch(
          `/api/reviews?quizId=${encodeURIComponent(quizId)}&userId=${encodeURIComponent(userId)}`,
          { cache: 'no-store' },
        )

        const json = (await res.json()) as ReviewApiResponse

        if (!mounted) return

        if ('hasReviewed' in json) {
          setReviewState(json)
        } else {
          setReviewState({ hasReviewed: false, review: null })
        }
      } catch {
        if (mounted) setReviewState({ hasReviewed: false, review: null })
      } finally {
        if (mounted) setChecking(false)
      }
    }

    void loadReviewState()
    return () => {
      mounted = false
    }
  }, [quizId, userId])

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          rating,
          title,
          comment,
        }),
      })

      const json = (await res.json()) as {
        success?: boolean
        message?: string
      }

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to submit review')
      }

      setSubmitted(true)
      setReviewState({
        hasReviewed: true,
        review: {
          _id: '',
          rating,
          title,
          comment,
          createdAt: new Date().toISOString(),
        },
      })
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className='rounded-xl border dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm'>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          Checking review status...
        </p>
      </div>
    )
  }

  if (hidden) {
    return (
      <div className='rounded-xl border dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm'>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          Review prompt hidden. You can still review later from this page.
        </p>
        <button
          type='button'
          onClick={() => setHidden(false)}
          className='mt-3 rounded border px-3 py-2 text-sm dark:border-slate-600 dark:text-slate-300'
        >
          Show review form
        </button>
      </div>
    )
  }

  if (reviewState?.hasReviewed && reviewState.review) {
    return (
      <div className='rounded-xl border dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm'>
        <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
          You already reviewed this quiz
        </h2>
        <div className='mt-3 rounded-lg bg-slate-50 dark:bg-slate-700 p-4'>
          <p className='font-medium text-slate-900 dark:text-white'>
            {reviewState.review.title}
          </p>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            Rating: {reviewState.review.rating}/5
          </p>
          <p className='mt-2 text-sm text-slate-700 dark:text-slate-300'>
            {reviewState.review.comment}
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className='rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 p-4'>
        <p className='font-medium text-green-900 dark:text-green-300'>
          Thanks for reviewing this quiz!
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className='space-y-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm'
    >
      <div>
        <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
          Rate this quiz
        </h2>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          Your feedback helps improve quiz quality.
        </p>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Rating</label>
        <div className='flex flex-wrap gap-2'>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type='button'
              onClick={() => setRating(n)}
              className={`rounded-full border px-3 py-1 text-sm ${
                rating === n
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className='space-y-2'>
        <label htmlFor='review-title' className='text-sm font-medium'>
          Title
        </label>
        <input
          id='review-title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
          maxLength={50}
          className='w-full rounded border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white'
          placeholder='Short summary of your experience'
        />
      </div>

      <div className='space-y-2'>
        <label htmlFor='review-comment' className='text-sm font-medium'>
          Comment
        </label>
        <textarea
          id='review-comment'
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className='w-full rounded border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white'
          placeholder='Tell us what you liked or what can be improved'
        />
      </div>

      <div className='flex flex-wrap gap-3'>
        <button
          type='submit'
          disabled={loading}
          className='rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:disabled:opacity-50'
        >
          {loading ? 'Submitting...' : 'Submit review'}
        </button>

        <button
          type='button'
          onClick={() => setHidden(true)}
          className='rounded border px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white'
        >
          Skip for now
        </button>
      </div>
    </form>
  )
}
