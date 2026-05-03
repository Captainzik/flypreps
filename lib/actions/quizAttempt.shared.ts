import mongoose from 'mongoose'
import { getModeRules } from '@/lib/modes/rules'
import { buildAudioEventEnvelope } from '@/lib/actions/audio.actions'
import { getElapsedMs, shouldForceExamTimeout } from '@/lib/learning/timing'
import { getCurrentWeekPeriod } from '@/lib/utils'
import { connectToDatabase } from '@/lib/db'
import { Quiz } from '../db/models/quiz.model'
import { User } from '../db/models/user.model'
import { Leaderboard } from '../db/models/leaderboard.model'
import { QuizAttempt } from '../db/models/attempts.model'
import type { IQuestion } from '../db/models/question.model' // CHANGED: type-only import for isolatedModules.

export type QuizMode = 'exam' | 'cpd'

export const isMongoDuplicateKeyError = (
  err: unknown,
): err is { code: number } => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'number'
  )
}

export function getAttemptMode(input: {
  mode?: QuizMode
  allowedModes?: Array<'exam' | 'cpd'>
}) {
  if (input.mode) return input.mode

  // CHANGED: mode is now derived only from explicit allowedModes, not category.
  if (Array.isArray(input.allowedModes)) {
    const hasExam = input.allowedModes.includes('exam')
    const hasCpd = input.allowedModes.includes('cpd')

    if (hasCpd && !hasExam) return 'cpd'
    if (hasExam && !hasCpd) return 'exam'
  }

  // CHANGED: fallback defaults to exam when no explicit mode information exists.
  return 'exam'
}

export function getResultVisibility(mode: QuizMode) {
  return getModeRules(mode).resultVisibility
}

export function computeAttemptXp(params: {
  mode: QuizMode
  score: number
  maxScore: number
  percentage: number
}) {
  const rules = getModeRules(params.mode)
  if (!rules.xpEnabled) return 0

  const isPerfectScore = params.maxScore > 0 && params.score >= params.maxScore
  const highScorer = params.percentage >= 80

  const base = params.mode === 'exam' ? params.score * 2 : params.score * 10
  const bonus = isPerfectScore ? 25 : highScorer ? 10 : 0

  return base + bonus
}

export {
  mongoose,
  connectToDatabase,
  getModeRules,
  buildAudioEventEnvelope,
  getElapsedMs,
  shouldForceExamTimeout,
  getCurrentWeekPeriod,
  Quiz,
  User,
  Leaderboard,
  QuizAttempt,
}
export type { IQuestion } // CHANGED: type re-export uses export type for isolatedModules.
