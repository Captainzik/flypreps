import Link from 'next/link'
import data from '@/lib/data'
import { HomeCarousel } from '@/components/shared/home/home-carousel'

export default function HomePage() {
  const carouselItems = data.carousels
    .filter((item) => item.isPublished)
    .map((item) => ({
      image: item.image,
      url: item.url,
      title: item.title,
      buttonCaption: item.buttonCaption,
    }))

  return (
    <section className='space-y-6'>
      <div className='rounded-xl border border-slate-200 bg-white p-8 shadow-sm'>
        <h1 className='text-3xl font-bold text-slate-900'>
          Welcome to FlyPrep
        </h1>
        <p className='mt-3 max-w-2xl text-slate-600'>
          Practice quizzes, track your growth, and stay consistent with streaks,
          feed, and leaderboard insights.
        </p>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link
            href='/quiz'
            className='rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800'
          >
            Start Quiz
          </Link>
          <Link
            href='/feed'
            className='rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
          >
            Community Feed
          </Link>
          <Link
            href='/profile'
            className='rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
          >
            My Profile
          </Link>
        </div>
      </div>

      <HomeCarousel items={carouselItems} />
    </section>
  )
}
