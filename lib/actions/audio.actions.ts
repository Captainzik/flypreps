import type { SoundEvent } from '@/lib/audio/sound-events' // CHANGED: actions emit events, not sounds.

export type AudioEventEnvelope = {
  userId: string
  event: SoundEvent
  timestamp: Date
}

export function buildAudioEventEnvelope(
  userId: string,
  event: SoundEvent,
): AudioEventEnvelope {
  return {
    userId,
    event,
    timestamp: new Date(),
  }
}
