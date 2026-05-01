import { connectToDatabase, QuizAttempt } from './quizAttempt.shared'

export type FeedActivityItem = {
  id: string
  type: 'quiz_completed'
  title: string
  description: string
  occurredAt: Date
  score: number
  maxScore: number
  percentage: number
  category: string
  quizId: string
}

export async function getUserFeedActivity(params: {
  userId: string
  limit?: number
}): Promise<FeedActivityItem[]> {
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
      select: 'name',
    })
    .lean()

  return attempts.map((attempt) => {
    const quizObj = attempt.quiz as unknown as
      | {
          _id?: import('mongoose').Types.ObjectId
          name?: string
        }
      | undefined

    const quizName = quizObj?.name ?? 'Quiz'
    const totalQuestions = Array.isArray(attempt.answers)
      ? attempt.answers.length
      : 0

    return {
      id: attempt._id.toString(),
      type: 'quiz_completed',
      title: `Completed ${quizName}`,
      description: `Answered ${attempt.questionsAnswered}/${totalQuestions} questions • ${attempt.percentage.toFixed(1)}%`,
      occurredAt: attempt.completedAt ?? attempt.startedAt,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      category: attempt.category || '',
      quizId: quizObj?._id?.toString?.() ?? '',
    }
  })
}
