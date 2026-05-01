import { connectToDatabase, QuizAttempt } from './quizAttempt.shared'

export type QuizHistoryItem = {
  id: string
  quizId: string
  quizName: string
  category: string
  score: number
  maxScore: number
  percentage: number
  completed: boolean
  startedAt: Date
  completedAt?: Date
  timeTakenMs?: number
  questionsAnswered: number
  totalQuestions: number
}

export async function getUserQuizHistory(params: {
  userId: string
  limit?: number
}): Promise<QuizHistoryItem[]> {
  await connectToDatabase()

  const limit = Math.min(Math.max(params.limit ?? 50, 1), 200)

  const attempts = await QuizAttempt.find({
    user: params.userId,
    completed: true,
  })
    .sort({ completedAt: -1, _id: -1 })
    .limit(limit)
    .populate({
      path: 'quiz',
      select: 'name category',
    })
    .lean()

  return attempts.map((attempt) => {
    const quizObj = attempt.quiz as unknown as
      | {
          _id?: import('mongoose').Types.ObjectId
          name?: string
          category?: string
        }
      | undefined

    return {
      id: attempt._id.toString(),
      quizId: quizObj?._id?.toString?.() ?? '',
      quizName: quizObj?.name ?? 'Quiz',
      category: attempt.category || quizObj?.category || '',
      score: attempt.score ?? 0,
      maxScore: attempt.maxScore ?? 0,
      percentage: attempt.percentage ?? 0,
      completed: Boolean(attempt.completed),
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      timeTakenMs: attempt.timeTakenMs,
      questionsAnswered: attempt.questionsAnswered ?? 0,
      totalQuestions: Array.isArray(attempt.answers)
        ? attempt.answers.length
        : 0,
    }
  })
}
