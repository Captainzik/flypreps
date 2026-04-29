import type {
  QuizMode,
  ResultVisibility,
  SessionStatus,
  SoundEventKey,
} from '@/lib/modes/types' // CHANGED: session state can emit audio-friendly event keys.

export type LearningAnswer = {
  questionId: string
  selectedOptionIndex?: number
  isCorrect?: boolean
  pointsEarned?: number
  timeSpentMs?: number
}

export type LearningCheckpoint = {
  checkpointIndex: number
  questionIndex: number
  answeredCount: number
  score: number
  maxScore: number
  percentage: number
  savedAt: Date
}

export type LearningSessionState = {
  sessionId: string
  userId: string
  quizId: string
  mode: QuizMode
  status: SessionStatus
  resultVisibility: ResultVisibility
  currentQuestionIndex: number
  answeredCount: number
  totalQuestions: number
  score: number
  maxScore: number
  percentage: number
  answers: LearningAnswer[]
  checkpoint?: LearningCheckpoint
  startedAt: Date
  pausedAt?: Date
  resumedAt?: Date
  completedAt?: Date
  endedAt?: Date
  timeTakenMs?: number // CHANGED: stores total elapsed time for CPD result display.
  questionStartedAt?: Date // CHANGED: supports strict exam timing per question.
  questionTimeLimitMs?: number // CHANGED: lets UI/services know the active time constraint.
  checkpointDeadlineAt?: Date // CHANGED: tracks checkpoint break deadline.
  timedOut?: boolean // CHANGED: identifies forced completion due to time expiry.
  forceCompletedByTimeout?: boolean // CHANGED: exam mode can auto-finish on timeout.
  adBreakPending?: boolean // CHANGED: useful when exam reaches a mandatory ad/checkpoint point.
  adsServedCount: number
  heartsConsumed: number
  gemsEarned: number
  xpEarned: number
  soundMuted: boolean
  lastSoundEvent?: SoundEventKey
  soundEventQueue: SoundEventKey[]
}

export type StartLearningSessionInput = {
  userId: string
  quizId: string
  mode: QuizMode
  totalQuestions: number
}

export type SaveCheckpointInput = {
  sessionId: string
  questionIndex: number
  score: number
  maxScore: number
  answeredCount: number
}

export type ResumeLearningSessionInput = {
  sessionId: string
  userId: string
}

export type CompleteLearningSessionInput = {
  sessionId: string
  userId: string
}
