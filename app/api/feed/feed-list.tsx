'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { GlobalFeedItem } from '@/lib/actions/feed.actions'

type FeedResponse = {
  success: boolean
  items: GlobalFeedItem[]
  page: number
  pageSize: number
  hasMore: boolean
  message?: string
}

const PAGE_SIZE = 20

export default function FeedList({
  initialItems,
}: {
  initialItems: GlobalFeedItem[]
}) {
  const [items, setItems] = useState<GlobalFeedItem[]>(initialItems)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE)

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await fetch(
        `/api/feed?page=${nextPage}&pageSize=${PAGE_SIZE}`,
      )
      const data = (await res.json()) as FeedResponse

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load more activity')
      }

      setItems((prev) => [...prev, ...data.items])
      setPage(nextPage)
      setHasMore(data.hasMore)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load more activity',
      )
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading, page])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: '240px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (items.length === 0) {
    return (
      <section className='rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center'>
        <h2 className='text-lg font-semibold text-slate-900'>
          No activity yet
        </h2>
      </section>
    )
  }

  return (
    <section className='space-y-3'>
      {items.map((item) => (
        <article
          key={item.attemptId}
          className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'
        >
          <p className='text-sm text-slate-700'>
            <span className='font-semibold text-slate-900'>
              {item.userName}
            </span>{' '}
            did <span className='font-semibold'>{item.quizName}</span>{' '}
            {item.timeAgo}
          </p>

          <div className='mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3'>
            <p>
              <span className='font-medium'>Score:</span> {item.score}/
              {item.maxScore}
            </p>
            <p>
              <span className='font-medium'>Percentage:</span>{' '}
              {item.percentage.toFixed(1)}%
            </p>
            <p>
              <span className='font-medium'>Category:</span>{' '}
              {item.category || 'General'}
            </p>
          </div>

          <div className='mt-4 flex gap-2'>
            <Link
              href={`/quiz/attempt/${item.attemptId}/result`}
              className='inline-flex rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800'
            >
              View result
            </Link>

            {item.quizId ? (
              <Link
                href={`/quiz/${item.quizId}`}
                className='inline-flex rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50'
              >
                Quiz details
              </Link>
            ) : null}
          </div>
        </article>
      ))}

      <div ref={sentinelRef} />

      {loading ? (
        <p className='py-3 text-center text-sm text-slate-500'>
          Loading more...
        </p>
      ) : null}

      {!hasMore ? (
        <p className='py-3 text-center text-sm text-slate-500'>
          You reached the end of the feed.
        </p>
      ) : null}
    </section>
  )
}
