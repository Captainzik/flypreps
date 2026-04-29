import type { SoundEventKey } from '@/lib/modes/types' // CHANGED: streak changes can trigger audio cues without coupling to playback.

export type StreakState = {
  currentStreak: number
  longestStreak: number
  lastStreakDate?: Date
  streakFreezeCount: number
  streakFreezeResetAt?: Date
}

export function canUseStreakFreeze(
  state: StreakState,
  maxPerWeek = 2,
  now = new Date(),
) {
  if (
    state.streakFreezeResetAt &&
    state.streakFreezeResetAt.getTime() > now.getTime()
  ) {
    return state.streakFreezeCount < maxPerWeek
  }

  return state.streakFreezeCount < maxPerWeek
}

export function applyDailyStreak(state: StreakState, today = new Date()) {
  const nextCurrent = Math.max(1, state.currentStreak + 1)
  const nextLongest = Math.max(state.longestStreak, nextCurrent)

  return {
    ...state,
    currentStreak: nextCurrent,
    longestStreak: nextLongest,
    lastStreakDate: today,
  }
}

export function resetStreak(state: StreakState) {
  return {
    ...state,
    currentStreak: 0,
  }
}

export function formatStreakLabel(currentStreak: number) {
  if (currentStreak <= 0) return 'No streak yet'
  if (currentStreak === 1) return '1 day streak'
  return `${currentStreak} day streak`
}

export function getStreakSoundEvent(
  currentStreak: number,
): SoundEventKey | null {
  if (currentStreak <= 0) return null
  return currentStreak >= 7 ? 'streak_up' : null
}
