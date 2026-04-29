import type { AudioSoundDefinition } from './types' // CHANGED: sound catalog is separate from playback logic.

export const AUDIO_SOUNDS: AudioSoundDefinition[] = [
  {
    id: 'answer_correct',
    src: '/audio/correct.mp3',
    volume: 0.7,
    preload: 'auto',
  },
  {
    id: 'answer_wrong',
    src: '/audio/wrong.mp3',
    volume: 0.7,
    preload: 'auto',
  },
  {
    id: 'streak_up',
    src: '/audio/streak-up.mp3',
    volume: 0.8,
    preload: 'auto',
  },
  {
    id: 'badge_unlock',
    src: '/audio/badge-unlock.mp3',
    volume: 0.8,
    preload: 'auto',
  },
  {
    id: 'level_up',
    src: '/audio/level-up.mp3',
    volume: 0.85,
    preload: 'auto',
  },
  {
    id: 'heart_loss',
    src: '/audio/heart-loss.mp3',
    volume: 0.7,
    preload: 'auto',
  },
  {
    id: 'heart_refill',
    src: '/audio/heart-refill.mp3',
    volume: 0.75,
    preload: 'auto',
  },
  {
    id: 'reward_claim',
    src: '/audio/reward-claim.mp3',
    volume: 0.75,
    preload: 'auto',
  },
  {
    id: 'quiz_complete',
    src: '/audio/quiz-complete.mp3',
    volume: 0.85,
    preload: 'auto',
  },
  {
    id: 'checkpoint_saved',
    src: '/audio/checkpoint-saved.mp3',
    volume: 0.55,
    preload: 'metadata',
  },
  {
    id: 'mode_enter',
    src: '/audio/mode-enter.mp3',
    volume: 0.6,
    preload: 'metadata',
  },
  {
    id: 'mode_exit',
    src: '/audio/mode-exit.mp3',
    volume: 0.6,
    preload: 'metadata',
  },
]
