import type { AudioCueProfile, SoundEventKey } from '@/lib/modes/types' // CHANGED: audio is driven by shared event keys and cue profiles.

export type AudioPlaybackMode = 'local' | 'silent'

export type AudioSoundDefinition = {
  id: SoundEventKey
  src: string
  volume?: number
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
}

export type AudioEventPayload = {
  event: SoundEventKey
  mode?: 'exam' | 'cpd'
  profile?: AudioCueProfile
  volume?: number
  mute?: boolean
}

export type AudioSettings = {
  enabled: boolean
  muted: boolean
  profile: AudioCueProfile
  playbackMode: AudioPlaybackMode
}
