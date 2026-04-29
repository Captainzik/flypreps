import type { ModeRules, QuizMode } from './types' // CHANGED: mode policy is centralized here.

export const MODE_RULES: ModeRules = {
  exam: {
    name: 'exam',
    label: 'Exam Mode',
    description:
      'Serious long-form practice with checkpoints, hidden final results, and competitive progression.',
    questionLimit: undefined,
    resultVisibility: 'hidden_until_end',
    adBreakEvery: 10,
    allowResume: true,
    allowMidQuizFeedback: false,
    allowStreakFreeze: true,
    streakFreezeLimitPerWeek: 2,
    leagueEnabled: true,
    maxLeague: 10,
    heartsEnabled: true,
    gemsEnabled: true,
    xpEnabled: true,
    badgesEnabled: true,
    progressBarEnabled: true,
    checkpointsEnabled: true,
    timedBoostsEnabled: false,
    questsEnabled: false,
    referralRewardsEnabled: false,
    premiumBypassAds: true,
    audioEnabled: true,
    audioCueProfile: 'subtle',
    allowCelebrationSounds: false,
    allowErrorSounds: true,
    questionTimeLimitSeconds: 60, // CHANGED: 1 question = 1 minute in exam mode.
    checkpointIntervalQuestions: 10, // CHANGED: checkpoint/break after 10 questions.
    checkpointIntervalMinutes: 10, // CHANGED: 10 minutes total before checkpoint/break.
    forceExamCompletionOnTimeout: true, // CHANGED: exam is forced to finish when time expires.
  },
  cpd: {
    name: 'cpd',
    label: 'CPD Mode',
    description:
      'Short daily learning sessions with full gamification, feedback, rewards, and habit-building mechanics.',
    questionLimit: 10,
    resultVisibility: 'per_question',
    adBreakEvery: 10,
    allowResume: true,
    allowMidQuizFeedback: true,
    allowStreakFreeze: true,
    streakFreezeLimitPerWeek: 3,
    leagueEnabled: true,
    maxLeague: 10,
    heartsEnabled: true,
    gemsEnabled: true,
    xpEnabled: true,
    badgesEnabled: true,
    progressBarEnabled: true,
    checkpointsEnabled: true,
    timedBoostsEnabled: true,
    questsEnabled: true,
    referralRewardsEnabled: true,
    premiumBypassAds: true,
    audioEnabled: true,
    audioCueProfile: 'lively',
    allowCelebrationSounds: true,
    allowErrorSounds: true,
    questionTimeLimitSeconds: undefined,
    checkpointIntervalQuestions: undefined,
    checkpointIntervalMinutes: undefined,
    forceExamCompletionOnTimeout: false,
  },
}

export function getModeRules(mode: QuizMode) {
  return MODE_RULES[mode]
}

export function isModeEnabled(mode: string): mode is QuizMode {
  return mode === 'exam' || mode === 'cpd'
}
