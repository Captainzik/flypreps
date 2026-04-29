import type { SoundEventKey } from '@/lib/modes/types' // CHANGED: event names are shared with learning/economy/gamification.

export type SoundEvent =
  | { type: 'answer_correct'; mode: 'exam' | 'cpd'; questionId?: string }
  | { type: 'answer_wrong'; mode: 'exam' | 'cpd'; questionId?: string }
  | { type: 'streak_up'; streak: number }
  | { type: 'badge_unlock'; badgeId: string }
  | { type: 'level_up'; xp: number; level: number }
  | { type: 'heart_loss'; remainingHearts: number }
  | { type: 'heart_refill'; heartsAdded: number }
  | { type: 'reward_claim'; rewardType: 'ad' | 'quest' | 'referral' }
  | {
      type: 'quiz_complete'
      mode: 'exam' | 'cpd'
      score: number
      percentage: number
    }
  | { type: 'checkpoint_saved'; checkpointIndex: number }
  | { type: 'mode_enter'; mode: 'exam' | 'cpd' }
  | { type: 'mode_exit'; mode: 'exam' | 'cpd' }

export const SOUND_EVENT_TO_KEY: Record<SoundEvent['type'], SoundEventKey> = {
  answer_correct: 'answer_correct',
  answer_wrong: 'answer_wrong',
  streak_up: 'streak_up',
  badge_unlock: 'badge_unlock',
  level_up: 'level_up',
  heart_loss: 'heart_loss',
  heart_refill: 'heart_refill',
  reward_claim: 'reward_claim',
  quiz_complete: 'quiz_complete',
  checkpoint_saved: 'checkpoint_saved',
  mode_enter: 'mode_enter',
  mode_exit: 'mode_exit',
}

export function toSoundEventKey(event: SoundEvent): SoundEventKey {
  return SOUND_EVENT_TO_KEY[event.type]
}
