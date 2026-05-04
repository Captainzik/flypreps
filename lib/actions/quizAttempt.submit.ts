import { connectToDatabase, QuizAttempt } from './quizAttempt.shared'
import {
  getCheckpointResumeQuestionIndex,
  shouldCreateCheckpoint,
} from './quizAttempt.session' // CHANGED: submit flow now reuses the shared checkpoint math.

export async function submitAnswerToAttempt(input: {
  attemptId: string
  userId: string
  questionId: string
  selectedOptionIndex: number
  timeSpentMs?: number
}) {
  await connectToDatabase()

  const {
    attemptId,
    userId,
    questionId,
    selectedOptionIndex,
    timeSpentMs = 0,
  } = input

  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    user: userId,
  })

  if (!attempt) throw new Error('Attempt not found')
  if (attempt.completed) throw new Error('Attempt already completed')

  const answerIndex = attempt.answers.findIndex(
    (a) => a.question.toString() === questionId,
  )

  if (answerIndex === -1) {
    throw new Error('Question does not belong to this attempt')
  }

  attempt.answers[answerIndex].selectedOptionIndex = selectedOptionIndex
  attempt.answers[answerIndex].timeSpentMs = timeSpentMs

  attempt.questionsAnswered = attempt.answers.filter(
    (a) => typeof a.selectedOptionIndex === 'number',
  ).length // CHANGED: keep count in sync for persistence.

  attempt.currentQuestionIndex = answerIndex + 1 // CHANGED: move to the next question by index only.

  const answeredCount = attempt.questionsAnswered
  const checkpointBoundary = getCheckpointResumeQuestionIndex({
    answeredCount,
    checkpointSize: 10,
  }) // CHANGED: zero-based checkpoint boundary (0, 10, 20...).

  attempt.lastSeenQuestionIndex = answerIndex // CHANGED: track the furthest question actually answered.
  attempt.lastCheckpointAt = new Date() // CHANGED: update checkpoint timestamp on every answer.

  if (shouldCreateCheckpoint({ answeredCount, checkpointSize: 10 })) {
    attempt.checkpointIndex = checkpointBoundary // CHANGED: persist the resume boundary exactly every 10 answers.
    attempt.checkpointSavedAt = attempt.lastCheckpointAt
    attempt.status = 'paused' // CHANGED: checkpointed attempt is marked paused for resumable flow.
    attempt.pausedAt = attempt.lastCheckpointAt
  } else if (
    typeof attempt.checkpointIndex !== 'number' ||
    Number.isNaN(attempt.checkpointIndex)
  ) {
    attempt.checkpointIndex = checkpointBoundary // CHANGED: maintain a valid fallback checkpoint index.
  }

  if (attempt.currentQuestionIndex >= attempt.answers.length) {
    attempt.currentQuestionIndex = attempt.answers.length // CHANGED: boundary marker for completion; page will redirect to result.
  }

  await attempt.save()

  return {
    attemptId: attempt._id.toString(),
    questionsAnswered: attempt.questionsAnswered,
    totalQuestions: attempt.answers.length,
    currentQuestionIndex: attempt.currentQuestionIndex, // CHANGED: expose the next pointer to callers.
    checkpointIndex: attempt.checkpointIndex, // CHANGED: expose the resumable checkpoint boundary to callers.
    completed: attempt.completed,
  }
}
