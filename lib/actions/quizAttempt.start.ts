import {
  connectToDatabase,
  Quiz,
  QuizAttempt,
  getAttemptMode,
  getResultVisibility,
  buildAudioEventEnvelope,
} from './quizAttempt.shared'
import type { IQuizAttempt } from '../db/models/attempts.model'

export async function startQuizAttempt(input: {
  quizId: string
  userId: string
  attemptKey?: string
  mode?: 'exam' | 'cpd'
}) {
  await connectToDatabase()

  const { quizId, userId, attemptKey } = input

  const quiz = await Quiz.findById(quizId)
    .select('_id category questions')
    .lean()

  if (!quiz) throw new Error('Quiz not found')
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error('Quiz has no questions')
  }

  const mode = getAttemptMode({ mode: input.mode, quizCategory: quiz.category })
  const answers: IQuizAttempt['answers'] = quiz.questions.map((qId) => ({
    question: qId,
    selectedOptionIndex: undefined,
    isCorrect: false,
    pointsEarned: 0,
    timeSpentMs: 0,
  }))

  const now = new Date()
  const modeRules = await import('@/lib/modes/rules').then((m) =>
    m.getModeRules(mode),
  )
  const questionTimeLimitMs = modeRules.questionTimeLimitSeconds
    ? modeRules.questionTimeLimitSeconds * 1000
    : undefined
  const checkpointDeadlineMs = modeRules.checkpointIntervalMinutes
    ? modeRules.checkpointIntervalMinutes * 60_000
    : undefined

  const attempt = await QuizAttempt.create({
    user: userId,
    quiz: quiz._id,
    mode,
    status: 'in_progress',
    resultVisibility: getResultVisibility(mode),
    attemptKey:
      attemptKey ||
      `attempt_${userId}_${quizId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    startedAt: now,
    completed: false,
    score: 0,
    maxScore: quiz.questions.length * (mode === 'exam' ? 2 : 10),
    percentage: 0,
    questionsAnswered: 0,
    currentQuestionIndex: 0,
    checkpointIndex: 0,
    checkpointSavedAt: now,
    questionTimeLimitMs,
    checkpointDeadlineMs,
    timedOut: false,
    forceCompletedByTimeout: false,
    adsServedCount: 0,
    heartsConsumed: 0,
    gemsEarned: 0,
    xpEarned: 0,
    answers,
    category: quiz.category,
  })

  void buildAudioEventEnvelope(userId, { type: 'mode_enter', mode }) // CHANGED: emit mode entry event from start action.

  return attempt
}
