import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getUserQuizHistory } from '@/lib/actions/quizAttempt.history'

export default async function CpdHistoryPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/signin?callbackUrl=/cpd/history') // CHANGED: keeps your current CPD history route.
  }

  const cpdHistory = await getUserQuizHistory({
    userId: session.user.id,
    limit: 100,
    mode: 'cpd', // CHANGED: query CPD history directly so exam attempts never leak in.
  })

  return (
    <main className='space-y-4 sm:space-y-6'>
      <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
          CPD History
        </h1>
        <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
          Review your previous CPD attempts and performance.
        </p>
      </section>

      {cpdHistory.length === 0 ? (
        <section className='rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800 sm:p-8'>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
            No CPD attempts yet
          </h2>
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
            Start a CPD quiz to build your history.
          </p>
          <Link
            href='/cpd/start'
            className='mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600'
          >
            Start CPD
          </Link>
        </section>
      ) : (
        <section className='space-y-3'>
          {cpdHistory.map((item) => (
            <article
              key={item.id}
              className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5'
            >
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h2 className='text-base font-semibold text-slate-900 dark:text-white wrap-break-words'>
                    {item.quizName}
                  </h2>
                  <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                    {item.category || 'General'}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    item.completed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}
                >
                  {item.completed ? 'Completed' : 'In progress'}
                </span>
              </div>

              <div className='mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-4'>
                <p>
                  <span className='font-medium'>Score:</span> {item.score} /{' '}
                  {item.maxScore}
                </p>
                <p>
                  <span className='font-medium'>Percentage:</span>{' '}
                  {item.percentage.toFixed(1)}%
                </p>
                <p>
                  <span className='font-medium'>Answered:</span>{' '}
                  {item.questionsAnswered} / {item.totalQuestions}
                </p>
                <p>
                  <span className='font-medium'>Started:</span>{' '}
                  {new Date(item.startedAt).toLocaleString()}
                </p>
              </div>

              <div className='mt-4 flex flex-wrap gap-2'>
                {item.completed ? (
                  <Link
                    href={`/cpd/attempt/${item.id}/result`}
                    className='inline-flex rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                  >
                    View result
                  </Link>
                ) : (
                  <Link
                    href={`/cpd/attempt/${item.id}`}
                    className='inline-flex rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                  >
                    Continue attempt
                  </Link>
                )}

                {item.quizId ? (
                  <Link
                    href={`/cpd/${item.quizId}`}
                    className='inline-flex rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  >
                    Quiz details
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
