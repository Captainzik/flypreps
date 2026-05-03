import { connectToDatabase, QuizAttempt } from './quizAttempt.shared'

export type QuizMode = 'exam' | 'cpd' // CHANGED: history now exposes attempt mode directly.

export type QuizHistoryItem = {
  id: string
  quizId: string
  quizName: string
  mode: QuizMode // CHANGED: direct mode field for filtering.
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
  mode?: QuizMode // CHANGED: allow exam-only or CPD-only retrieval.
}): Promise<QuizHistoryItem[]> {
  await connectToDatabase()

  const limit = Math.min(Math.max(params.limit ?? 50, 1), 200)

  const query: Record<string, unknown> = {
    user: params.userId,
    completed: true,
  }

  if (params.mode) {
    query.mode = params.mode // CHANGED: filter by explicit attempt mode.
  }

  const attempts = await QuizAttempt.find(query)
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

    const mode: QuizMode = attempt.mode

    return {
      id: attempt._id.toString(),
      quizId: quizObj?._id?.toString?.() ?? '',
      quizName: quizObj?.name ?? 'Quiz',
      mode, // CHANGED: returned for direct mode-based filtering in pages.
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
