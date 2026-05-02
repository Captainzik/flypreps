'use server'

import { connectToDatabase } from '@/lib/db'
import { Quiz } from '@/lib/db/models/quiz.model'

type QuizCategory = 'Radiography' | 'Sonography'
type QuizMode = 'exam' | 'cpd'

type QuizLean = {
  _id: { toString(): string }
  name?: string
  description?: string
  category: QuizCategory
  allowedModes: QuizMode[] // CHANGED: start pages now filter quizzes by allowedModes.
  questions?: unknown[]
  image?: string
  isPublished?: boolean
}

export type StartableQuiz = {
  _id: string
  name: string
  description: string
  category: QuizCategory
  allowedModes: QuizMode[] // CHANGED: returned to the UI so exam/CPD pages can filter cleanly.
  questionsCount: number
  image?: string
  isPublished: boolean
}

export async function getStartableQuizzes(): Promise<StartableQuiz[]> {
  await connectToDatabase()

  const quizzes = (await Quiz.find({ isPublished: true })
    .select(
      '_id name description category allowedModes questions image isPublished',
    )
    .sort({ updatedAt: -1 })
    .lean()) as QuizLean[]

  return quizzes.map((q) => ({
    _id: q._id.toString(),
    name: q.name ?? '',
    description: q.description ?? '',
    category: q.category,
    allowedModes: q.allowedModes ?? ['exam'], // CHANGED: safe fallback for older records.
    questionsCount: Array.isArray(q.questions) ? q.questions.length : 0,
    image: q.image || '',
    isPublished: q.isPublished === true,
  }))
}
