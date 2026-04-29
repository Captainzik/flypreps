import type { QuizMode } from '@/lib/modes/types' // CHANGED: timing helpers are mode-aware but remain UI-agnostic.

export function formatDuration(ms: number) {
  const safeMs = Math.max(0, ms)
  const totalSeconds = Math.floor(safeMs / 1000)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatCountdown(ms: number) {
  const safeMs = Math.max(0, ms)
  const totalSeconds = Math.ceil(safeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}` // CHANGED: used for live exam countdown display.
}

export function getElapsedMs(startedAt: Date, endedAt = new Date()) {
  return Math.max(0, endedAt.getTime() - startedAt.getTime())
}

export function getQuestionTimeLimitMs(mode: QuizMode) {
  if (mode !== 'exam') return undefined
  return 60_000 // CHANGED: exam mode enforces 1 question per minute.
}

export function getExamCheckpointDeadlineMs(totalQuestions: number) {
  return Math.max(1, totalQuestions) * 60_000 // CHANGED: 10 questions = 10 minutes checkpoint/break window.
}

export function shouldForceExamTimeout(params: {
  mode: QuizMode
  startedAt: Date
  now?: Date
  totalQuestions: number
}) {
  if (params.mode !== 'exam') return false

  const now = params.now ?? new Date()
  const elapsed = getElapsedMs(params.startedAt, now)
  const maxAllowed = getExamCheckpointDeadlineMs(params.totalQuestions)

  return elapsed >= maxAllowed
}

export function getReadableTimeTaken(startedAt: Date, completedAt?: Date) {
  const end = completedAt ?? new Date()
  return formatDuration(getElapsedMs(startedAt, end))
}

export function getActiveAttemptTimerState(params: {
  mode: QuizMode
  startedAt: Date
  totalQuestions: number
  now?: Date
}) {
  if (params.mode !== 'exam') {
    return {
      showTimer: false,
      remainingMs: undefined,
      totalMs: undefined,
      expired: false,
      countdownLabel: undefined,
    }
  }

  const now = params.now ?? new Date()
  const totalMs = getExamCheckpointDeadlineMs(params.totalQuestions)
  const elapsedMs = getElapsedMs(params.startedAt, now)
  const remainingMs = Math.max(0, totalMs - elapsedMs)

  return {
    showTimer: true, // CHANGED: only exam mode should render a running timer in the UI.
    remainingMs,
    totalMs,
    expired: remainingMs === 0,
    countdownLabel: formatCountdown(remainingMs), // CHANGED: ready-to-render label for the UI.
  }
}
