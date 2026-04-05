import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Types } from 'mongoose'
import { connectToDatabase } from '@/lib/db'
import { Quiz } from '@/lib/db/models/quiz.model'
import { Question } from '@/lib/db/models/question.model'

type PageProps = {
  params: Promise<{
    quizId: string
  }>
}

type LeanQuestion = {
  _id: { toString(): string }
  question: string
  options: { text: string; isCorrect?: boolean }[]
  image?: string | null
  tips?: string
}

type LeanQuiz = {
  _id: { toString(): string }
  name: string
  description: string
  category: 'ARDMS' | 'Sonography Canada' | 'CAMRT' | 'ARRT' | 'CPD'
  isPublished?: boolean
  questions: Array<{ toString(): string }>
}

export default async function QuizDetailsPage({ params }: PageProps) {
  const { quizId } = await params

  // Prevent CastError for non-ObjectId values like "history"
  if (!Types.ObjectId.isValid(quizId)) {
    notFound()
  }

  await connectToDatabase()

  const quiz = (await Quiz.findById(quizId)
    .select('_id name description category isPublished questions')
    .lean()) as LeanQuiz | null

  if (!quiz || quiz.isPublished !== true) {
    notFound()
  }

  const questionIds = Array.isArray(quiz.questions)
    ? quiz.questions.map((id) => id.toString())
    : []

  if (questionIds.length === 0) {
    notFound()
  }

  const questions = (await Question.find({ _id: { $in: questionIds } })
    .select('_id question options image tips')
    .lean()) as LeanQuestion[]

  if (questions.length === 0) {
    notFound()
  }

  return (
    <main className='space-y-6'>
      <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h1 className='text-2xl font-bold text-slate-900'>{quiz.name}</h1>
        <p className='mt-1 text-sm text-slate-600'>{quiz.description}</p>
        <div className='mt-3 flex items-center gap-2'>
          <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'>
            {quiz.category}
          </span>
          <span className='text-xs text-slate-500'>
            {questions.length} question{questions.length === 1 ? '' : 's'}
          </span>
        </div>
      </section>

      <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='text-lg font-semibold text-slate-900'>
          Ready to begin?
        </h2>
        <p className='mt-1 text-sm text-slate-600'>
          This attempt will include all available questions for this quiz.
        </p>

        <div className='mt-4 flex flex-wrap gap-3'>
          <Link
            href={`/quiz/${quiz._id.toString()}/attempt`}
            className='inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800'
          >
            Start now
          </Link>

          <Link
            href='/quiz/start'
            className='inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
          >
            Back to quiz list
          </Link>
        </div>
      </section>

      <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h3 className='text-base font-semibold text-slate-900'>
          Question preview
        </h3>
        <ol className='mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700'>
          {questions.map((q) => (
            <li key={q._id.toString()}>{q.question}</li>
          ))}
        </ol>
      </section>
    </main>
  )
}
