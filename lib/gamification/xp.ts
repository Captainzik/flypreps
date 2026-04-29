import type { QuizMode, SoundEventKey } from '@/lib/modes/types' // CHANGED: XP helpers remain pure but audio-aware.

export type XPAwardRule = {
  correctAnswerXp: number
  completionBonusXp: number
  dailyWindowBonusXp: number
  streakBonusXp: number
  highScorerXpBonus: number // CHANGED: bonus for >=80% correct.
  perfectScoreXpBonus: number // CHANGED: bonus for 100% correct.
}

export const DEFAULT_XP_RULES: Record<QuizMode, XPAwardRule> = {
  exam: {
    correctAnswerXp: 2,
    completionBonusXp: 10,
    dailyWindowBonusXp: 0,
    streakBonusXp: 0,
    highScorerXpBonus: 10,
    perfectScoreXpBonus: 25,
  },
  cpd: {
    correctAnswerXp: 10,
    completionBonusXp: 50,
    dailyWindowBonusXp: 25,
    streakBonusXp: 10,
    highScorerXpBonus: 10,
    perfectScoreXpBonus: 25,
  },
}

export function isTimedXpBoostActive(date = new Date()) {
  const hour = date.getHours()
  return hour >= 6 && hour < 12
}

export function calculateQuestionXp(params: {
  mode: QuizMode
  isCorrect: boolean
  completedAt?: Date
}) {
  const rules = DEFAULT_XP_RULES[params.mode]
  if (!params.isCorrect) return 0

  let xp = rules.correctAnswerXp

  if (
    params.mode === 'cpd' &&
    params.completedAt &&
    isTimedXpBoostActive(params.completedAt)
  ) {
    xp += rules.dailyWindowBonusXp
  }

  return xp
}

export function calculateCompletionXp(
  mode: QuizMode,
  completedAt = new Date(),
) {
  const rules = DEFAULT_XP_RULES[mode]
  let xp = rules.completionBonusXp

  if (mode === 'cpd' && isTimedXpBoostActive(completedAt)) {
    xp += rules.dailyWindowBonusXp
  }

  return xp
}

export function calculatePerformanceBonusXp(params: {
  mode: QuizMode
  percentage: number
  isPerfectScore: boolean
}) {
  const rules = DEFAULT_XP_RULES[params.mode]

  if (params.isPerfectScore) {
    return rules.perfectScoreXpBonus
  }

  if (params.percentage >= 80) {
    return rules.highScorerXpBonus
  }

  return 0
}

export function calculateLevelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 500) + 1)
}

export function getXpSoundEvent(
  mode: QuizMode,
  earnedXp: number,
): SoundEventKey | null {
  if (earnedXp <= 0) return null
  if (earnedXp >= 100) return 'level_up'
  return mode === 'cpd' ? 'reward_claim' : null
}
