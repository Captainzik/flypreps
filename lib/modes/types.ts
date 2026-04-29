export type QuizMode = 'exam' | 'cpd' // CHANGED: two core application modes.

export type ResultVisibility = 'hidden_until_end' | 'per_question' // CHANGED: exam hides results; cpd can reveal them progressively.

export type SessionStatus =
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'ended'
  | 'abandoned' // CHANGED: explicit lifecycle states support checkpoints and forced completion.

export type AudioCueProfile = 'subtle' | 'balanced' | 'lively' // CHANGED: audio behavior is mode-driven.

export type SoundEventKey =
  | 'answer_correct'
  | 'answer_wrong'
  | 'streak_up'
  | 'badge_unlock'
  | 'level_up'
  | 'heart_loss'
  | 'heart_refill'
  | 'reward_claim'
  | 'quiz_complete'
  | 'checkpoint_saved'
  | 'mode_enter'
  | 'mode_exit' // CHANGED: audio event names are shared across systems.

export type ModeConfig = {
  name: QuizMode
  label: string
  description: string
  questionLimit?: number
  resultVisibility: ResultVisibility
  adBreakEvery?: number
  allowResume: boolean
  allowMidQuizFeedback: boolean
  allowStreakFreeze: boolean
  streakFreezeLimitPerWeek: number
  leagueEnabled: boolean
  maxLeague?: number
  heartsEnabled: boolean
  gemsEnabled: boolean
  xpEnabled: boolean
  badgesEnabled: boolean
  progressBarEnabled: boolean
  checkpointsEnabled: boolean
  timedBoostsEnabled: boolean
  questsEnabled: boolean
  referralRewardsEnabled: boolean
  premiumBypassAds: boolean
  audioEnabled: boolean
  audioCueProfile: AudioCueProfile
  allowCelebrationSounds: boolean
  allowErrorSounds: boolean
  questionTimeLimitSeconds?: number // CHANGED: supports strict exam timing per question.
  checkpointIntervalQuestions?: number // CHANGED: checkpoint cadence is mode-specific.
  checkpointIntervalMinutes?: number // CHANGED: supports time-based checkpoint/break logic.
  forceExamCompletionOnTimeout?: boolean // CHANGED: exam can be force-completed when time runs out.
}

export type ModeRules = Record<QuizMode, ModeConfig>

export type ModeProgressSummary = {
  mode: QuizMode
  totalQuestions: number
  answeredQuestions: number
  completedQuestions: number
  score: number
  maxScore: number
  percentage: number
  remainingQuestions: number
  status: SessionStatus
}
