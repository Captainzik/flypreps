import Link from 'next/link'
import { auth } from '@/auth'
import { getStartableQuizzes } from '@/lib/actions/quiz.actions'

export default async function QuizHomePage() {
  const session = await auth()
  const quizzes = await getStartableQuizzes()

  return (
    <main className='space-y-6'>
      <section className='rounded-xl border dark:border-slate-700 dark:bg-slate-800 p-6 shadow-sm'>
        <h1 className='text-2xl font-bold dark:text-white'>Quiz Dashboard</h1>
        <p className='mt-1 text-sm dark:text-slate-400'>
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <Link
          href='/quiz/start'
          className='rounded-xl border dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm transition hover:shadow-md'
        >
          <h2 className='font-semibold dark:text-white'>Start New Quiz</h2>
          <p className='mt-1 text-sm dark:text-slate-400'>
            Browse {quizzes.length} available published quiz
            {quizzes.length === 1 ? '' : 'zes'} and begin your assessment.
          </p>
        </Link>

        <Link
          href='/quiz/history'
          className='rounded-xl border dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm transition hover:shadow-md'
        >
          <h2 className='font-semibold dark:text-white'>
            View Attempt History
          </h2>
          <p className='mt-1 text-sm dark:text-slate-400'>
            Review your past attempts and progress.
          </p>
        </Link>
      </section>
    </main>
  )
}
