import Link from 'next/link'
import { auth } from '@/auth'
import { getStartableQuizzes } from '@/lib/actions/quiz.actions'

export default async function QuizHomePage() {
  const session = await auth()
  const quizzes = await getStartableQuizzes()

  const examCount = quizzes.filter((quiz) =>
    quiz.allowedModes.includes('exam'),
  ).length // CHANGED: dashboard now shows mode-aware exam availability.
  const cpdCount = quizzes.filter((quiz) =>
    quiz.allowedModes.includes('cpd'),
  ).length // CHANGED: dashboard now shows mode-aware CPD availability.

  return (
    <main className='space-y-4 sm:space-y-6'>
      {/* CHANGED: quiz dashboard intro card gets reduced padding on mobile. */}
      <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
          Quiz Dashboard
        </h1>
        <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}.
        </p>
      </section>

      {/* CHANGED: action cards stack on phones and become a 2-column grid later. */}
      <section className='grid gap-4 md:grid-cols-2'>
        <Link
          href='/exam/start'
          className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-5'
        >
          <h2 className='font-semibold text-slate-900 dark:text-white'>
            Start Exam
          </h2>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            Browse {examCount} exam-available quiz
            {examCount === 1 ? '' : 'zes'} and begin your assessment.
          </p>
        </Link>

        <Link
          href='/exam/history'
          className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-5'
        >
          <h2 className='font-semibold text-slate-900 dark:text-white'>
            Exam History
          </h2>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            Review your exam attempts and progress.
          </p>
        </Link>

        <Link
          href='/cpd/start'
          className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-5'
        >
          <h2 className='font-semibold text-slate-900 dark:text-white'>
            Start CPD
          </h2>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            Browse {cpdCount} CPD-available quiz
            {cpdCount === 1 ? '' : 'zes'} and begin your assessment.
          </p>
        </Link>

        <Link
          href='/cpd/history'
          className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-5'
        >
          <h2 className='font-semibold text-slate-900 dark:text-white'>
            CPD History
          </h2>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            Review your CPD attempts and progress.
          </p>
        </Link>
      </section>
    </main>
  )
}
