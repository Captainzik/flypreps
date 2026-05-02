import mongoose from 'mongoose'
import { Leaderboard } from '@/lib/db/models/leaderboard.model'
import { getCurrentWeekPeriod } from '@/lib/utils'

export type CategoryType = 'Radiography' | 'Sonography'

export type UpsertLeaderboardFromAttemptParams = {
  userId: string
  category: CategoryType
  score: number
  percentage: number
  attemptedAt?: Date
  session?: mongoose.ClientSession
}

/**
 * Upserts leaderboard entry for current period and recomputes averagePercentage.
 * Requires leaderboard schema to have:
 * - totalScore
 * - quizAttempts
 * - totalPercentage
 * - averagePercentage
 * - bestPercentage
 * - categoryScores (Map)
 */
export async function upsertLeaderboardFromAttempt({
  userId,
  category,
  score,
  percentage,
  attemptedAt = new Date(),
  session,
}: UpsertLeaderboardFromAttemptParams) {
  const period = getCurrentWeekPeriod()

  const updated = await Leaderboard.findOneAndUpdate(
    { period, user: userId },
    {
      $inc: {
        totalScore: score,
        quizAttempts: 1,
        totalPercentage: percentage,
        [`categoryScores.${category}`]: score,
      },
      $max: { bestPercentage: percentage },
      $set: { lastAttemptAt: attemptedAt },
      $setOnInsert: {
        averagePercentage: 0,
      },
    },
    { upsert: true, returnDocument: 'after', session },
  )

  if (!updated) {
    throw new Error('Failed to upsert leaderboard entry')
  }

  const averagePercentage =
    updated.quizAttempts > 0
      ? updated.totalPercentage / updated.quizAttempts
      : 0

  await Leaderboard.updateOne(
    { _id: updated._id },
    { $set: { averagePercentage } },
    { session },
  )

  return {
    period,
    averagePercentage,
  }
}
