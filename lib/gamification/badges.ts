import type { QuizMode, SoundEventKey } from '@/lib/modes/types' // CHANGED: badge helpers can emit a sound key when a badge unlocks.

export type BadgeType =
  | 'first-quiz'
  | 'streak-3'
  | 'streak-7'
  | 'streak-30'
  | 'quiz-10'
  | 'quiz-50'
  | 'quiz-100'
  | 'accuracy-80'
  | 'accuracy-90'
  | 'monthly-champion'
  | 'exam-master'
  | 'cpd-consistent'

export type BadgeDefinition = {
  id: BadgeType
  title: string
  description: string
  mode?: QuizMode
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-quiz',
    title: 'First Steps',
    description: 'Complete your first quiz.',
  },
  {
    id: 'streak-3',
    title: 'On a Roll',
    description: 'Build a 3-day streak.',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Build a 7-day streak.',
  },
  {
    id: 'streak-30',
    title: 'Monthly Legend',
    description: 'Build a 30-day streak.',
  },
  {
    id: 'quiz-10',
    title: 'Getting Started',
    description: 'Complete 10 quizzes.',
  },
  {
    id: 'quiz-50',
    title: 'Dedicated Learner',
    description: 'Complete 50 quizzes.',
  },
  {
    id: 'quiz-100',
    title: 'Quiz Master',
    description: 'Complete 100 quizzes.',
  },
  {
    id: 'accuracy-80',
    title: 'Strong Performance',
    description: 'Score at least 80% on a quiz.',
  },
  {
    id: 'accuracy-90',
    title: 'High Achiever',
    description: 'Score at least 90% on a quiz.',
  },
  {
    id: 'monthly-champion',
    title: 'Monthly Champion',
    description: 'Earn top monthly performance.',
  },
  {
    id: 'exam-master',
    title: 'Exam Master',
    description: 'Excel in exam mode.',
    mode: 'exam',
  },
  {
    id: 'cpd-consistent',
    title: 'CPD Consistent',
    description: 'Keep showing up in CPD mode.',
    mode: 'cpd',
  },
]

export function getBadgeById(id: BadgeType) {
  return BADGES.find((badge) => badge.id === id) ?? null
}

export function getModeBadges(mode: QuizMode) {
  return BADGES.filter((badge) => !badge.mode || badge.mode === mode)
}

export function getBadgeUnlockSoundEvent(): SoundEventKey {
  return 'badge_unlock'
}
