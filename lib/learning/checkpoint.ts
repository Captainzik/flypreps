import type { LearningCheckpoint, SaveCheckpointInput } from './session.types' // CHANGED: checkpoint logic stays reusable and session-agnostic.

export function buildCheckpoint(
  input: SaveCheckpointInput,
  savedAt = new Date(),
): LearningCheckpoint {
  const percentage =
    input.maxScore > 0 ? (input.score / input.maxScore) * 100 : 0

  return {
    checkpointIndex: input.questionIndex,
    questionIndex: input.questionIndex,
    answeredCount: input.answeredCount,
    score: input.score,
    maxScore: input.maxScore,
    percentage,
    savedAt,
  }
}

export function shouldSaveCheckpoint(
  questionIndex: number,
  totalQuestions: number,
  interval = 10,
) {
  if (totalQuestions <= 0) return false
  if (questionIndex < 0) return false

  const isLastQuestion = questionIndex >= totalQuestions - 1
  const isIntervalCheckpoint = (questionIndex + 1) % interval === 0

  return isLastQuestion || isIntervalCheckpoint
}

export function getNextResumeQuestionIndex(checkpoint: LearningCheckpoint) {
  return Math.max(0, checkpoint.questionIndex + 1)
}

export function shouldForceCompleteOnTimeout(
  elapsedMs: number,
  questionTimeLimitMs = 60_000,
  totalQuestions: number,
) {
  const maxAllowedMs = Math.max(1, totalQuestions) * questionTimeLimitMs
  return elapsedMs >= maxAllowedMs
}
