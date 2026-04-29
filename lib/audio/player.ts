import type { AudioEventPayload, AudioSettings } from './types' // CHANGED: playback stays separate from business logic.
import { AUDIO_SOUNDS } from './sounds'
import { toSoundEventKey } from './sound-events'

function getSoundDefinition(id: string) {
  return AUDIO_SOUNDS.find((sound) => sound.id === id) ?? null
}

export function canPlayAudio(settings: AudioSettings) {
  return settings.enabled && !settings.muted
}

export async function playAudioEvent(
  payload: AudioEventPayload,
  settings: AudioSettings,
) {
  if (!canPlayAudio(settings)) return false

  const key = payload.event
  const definition = getSoundDefinition(key)
  if (!definition) return false

  const audio = new Audio(definition.src)
  audio.preload = definition.preload ?? 'auto'
  audio.volume = payload.volume ?? definition.volume ?? 0.7
  audio.loop = Boolean(definition.loop)

  try {
    await audio.play()
    return true
  } catch {
    return false
  }
}

export function enqueueAudioEvent(
  event: Parameters<typeof toSoundEventKey>[0],
  queue: string[] = [],
) {
  return [...queue, toSoundEventKey(event)]
}
