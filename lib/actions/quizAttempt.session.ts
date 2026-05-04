import { Types } from 'mongoose'
import {
  connectToDatabase,
  Quiz,
  QuizAttempt,
  getAttemptMode,
  getResultVisibility,
} from './quizAttempt.shared'
import type { IQuizAttempt } from '../db/models/attempts.model'
import { getModeRules } from '@/lib/modes/rules'

export type QuizMode = 'exam' | 'cpd'

export type AttemptSessionResult = {
  _id: { toString(): string }
  user: IQuizAttempt['user']
  quiz: IQuizAttempt['quiz']
  mode: QuizMode
  completed: boolean
  startedAt: Date
  checkpointIndex: number
  status: IQuizAttempt['status']
  currentQuestionIndex?: number
  questionsAnswered?: number
} // CHANGED: shared return shape for both unfinished and newly-started attempts.

export function getCheckpointResumeQuestionIndex(params: {
  answeredCount: number
  checkpointSize?: number
}) {
  const checkpointSize = params.checkpointSize ?? 10
  if (checkpointSize <= 0) return 0

  // CHANGED: zero-based checkpoint boundary; 0-9 => 0, 10-19 => 10, 20-29 => 20.
  return Math.floor(params.answeredCount / checkpointSize) * checkpointSize
}

export function shouldCreateCheckpoint(params: {
  answeredCount: number
  checkpointSize?: number
}) {
  const checkpointSize = params.checkpointSize ?? 10
  if (checkpointSize <= 0) return false

  // CHANGED: checkpoint is saved exactly when answeredCount hits 10, 20, 30...
  return params.answeredCount > 0 && params.answeredCount % checkpointSize === 0
}

export async function findUnfinishedAttempt(params: {
  userId: string
  quizId: string
  mode: QuizMode
}): Promise<AttemptSessionResult | null> {
  await connectToDatabase()

  const attempt = await QuizAttempt.findOne({
    user: new Types.ObjectId(params.userId), // CHANGED: normalize string id for schema queries.
    quiz: new Types.ObjectId(params.quizId), // CHANGED: normalize string id for schema queries.
    mode: params.mode,
    completed: false,
    status: { $in: ['in_progress', 'paused'] },
  })
    .sort({ lastCheckpointAt: -1, updatedAt: -1, _id: -1 })
    .select(
      '_id user quiz mode completed startedAt checkpointIndex status currentQuestionIndex questionsAnswered',
    )
    .lean()

  return attempt as AttemptSessionResult | null // CHANGED: explicit lean result shape for caller reuse.
}

export async function startFreshAttempt(params: {
  userId: string
  quizId: string
  mode: QuizMode
  sessionKey?: string
}): Promise<IQuizAttempt> {
  await connectToDatabase()

  const quiz = await Quiz.findById(params.quizId)
    .select('_id questions allowedModes category')
    .lean()

  if (!quiz) throw new Error('Quiz not found')
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error('Quiz has no questions')
  }

  const mode = getAttemptMode({
    mode: params.mode,
    allowedModes: quiz.allowedModes as Array<'exam' | 'cpd'> | undefined,
  })

  const now = new Date()
  const modeRules = getModeRules(mode)

  const answers: IQuizAttempt['answers'] = quiz.questions.map((qId) => ({
    question: qId as Types.ObjectId,
    selectedOptionIndex: undefined,
    isCorrect: false,
    pointsEarned: 0,
    timeSpentMs: 0,
  }))

  const attempt = await QuizAttempt.create({
    user: new Types.ObjectId(params.userId), // CHANGED: convert string userId to ObjectId to match schema.
    quiz: quiz._id,
    mode,
    status: 'in_progress',
    resultVisibility: getResultVisibility(mode),
    startedAt: now,
    completed: false,
    score: 0,
    maxScore: quiz.questions.length * (mode === 'exam' ? 2 : 10),
    percentage: 0,
    questionsAnswered: 0,
    currentQuestionIndex: 0,
    checkpointIndex: 0,
    lastCheckpointAt: now, // CHANGED: initialize checkpoint timestamp for resumable exam sessions.
    lastSeenQuestionIndex: 0, // CHANGED: track the furthest point reached in the session.
    checkpointSavedAt: now,
    pausedAt: undefined,
    endedAt: undefined,
    endedReason: undefined,
    sessionKey:
      params.sessionKey ||
      `session_${params.userId}_${params.quizId}_${Date.now()}`,
    questionTimeLimitMs: modeRules.questionTimeLimitSeconds
      ? modeRules.questionTimeLimitSeconds * 1000
      : undefined,
    checkpointDeadlineMs: modeRules.checkpointIntervalMinutes
      ? modeRules.checkpointIntervalMinutes * 60_000
      : undefined,
    timedOut: false,
    forceCompletedByTimeout: false,
    adsServedCount: 0,
    heartsConsumed: 0,
    gemsEarned: 0,
    xpEarned: 0,
    answers,
    category: quiz.category,
  } as unknown as IQuizAttempt) // CHANGED: cast through unknown to satisfy strict Mongoose create typing.

  return attempt as IQuizAttempt
}

export async function saveCheckpoint(params: {
  attemptId: string
  userId: string
  questionIndex: number
  lastSeenQuestionIndex: number
}): Promise<IQuizAttempt | null> {
  await connectToDatabase()

  const attempt = await QuizAttempt.findOne({
    _id: new Types.ObjectId(params.attemptId), // CHANGED: normalize string id for schema queries.
    user: new Types.ObjectId(params.userId), // CHANGED: normalize string id for schema queries.
    completed: false,
    status: { $in: ['in_progress', 'paused'] },
  })

  if (!attempt) return null

  const checkpointBoundary = getCheckpointResumeQuestionIndex({
    answeredCount: params.lastSeenQuestionIndex,
    checkpointSize: 10,
  })

  attempt.lastSeenQuestionIndex = params.lastSeenQuestionIndex
  attempt.currentQuestionIndex = params.questionIndex
  attempt.checkpointIndex = checkpointBoundary
  attempt.lastCheckpointAt = new Date()

  if (
    shouldCreateCheckpoint({
      answeredCount: params.lastSeenQuestionIndex,
      checkpointSize: 10,
    })
  ) {
    attempt.checkpointSavedAt = attempt.lastCheckpointAt
    attempt.status = 'paused'
    attempt.pausedAt = attempt.lastCheckpointAt
  }

  await attempt.save()
  return attempt as IQuizAttempt
}

export async function discardAttempt(params: {
  attemptId: string
  userId: string
  reason: 'user_ended' | 'restart_requested'
}): Promise<boolean> {
  await connectToDatabase()

  const deleted = await QuizAttempt.deleteOne({
    _id: new Types.ObjectId(params.attemptId), // CHANGED: normalize string id for schema queries.
    user: new Types.ObjectId(params.userId), // CHANGED: normalize string id for schema queries.
  })

  return deleted.deletedCount > 0
}

export async function resumeFromCheckpoint(params: {
  attemptId: string
  userId: string
}): Promise<IQuizAttempt | null> {
  await connectToDatabase()

  const attempt = await QuizAttempt.findOne({
    _id: new Types.ObjectId(params.attemptId), // CHANGED: normalize string id for schema queries.
    user: new Types.ObjectId(params.userId), // CHANGED: normalize string id for schema queries.
    completed: false,
    status: { $in: ['in_progress', 'paused'] },
  }).lean()

  return attempt as IQuizAttempt | null
}
