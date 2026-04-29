import type { SoundEventKey } from '@/lib/modes/types' // CHANGED: league changes can trigger celebration audio.

export type LeagueTier = {
  rank: number
  name: string
  minXp: number
  maxXp: number
}

export const LEAGUES: LeagueTier[] = [
  { rank: 1, name: 'Bronze', minXp: 0, maxXp: 499 },
  { rank: 2, name: 'Silver', minXp: 500, maxXp: 999 },
  { rank: 3, name: 'Gold', minXp: 1000, maxXp: 1499 },
  { rank: 4, name: 'Platinum', minXp: 1500, maxXp: 1999 },
  { rank: 5, name: 'Diamond', minXp: 2000, maxXp: 2499 },
  { rank: 6, name: 'Elite', minXp: 2500, maxXp: 2999 },
  { rank: 7, name: 'Master', minXp: 3000, maxXp: 3499 },
  { rank: 8, name: 'Legend', minXp: 3500, maxXp: 3999 },
  { rank: 9, name: 'Champion', minXp: 4000, maxXp: 4499 },
  { rank: 10, name: 'GOAT', minXp: 4500, maxXp: Number.MAX_SAFE_INTEGER },
]

export function getLeagueByXp(xp: number) {
  return (
    LEAGUES.find((league) => xp >= league.minXp && xp <= league.maxXp) ??
    LEAGUES[0]
  )
}

export function getLeagueProgress(xp: number) {
  const league = getLeagueByXp(xp)
  const nextLeague = LEAGUES.find((entry) => entry.rank === league.rank + 1)

  if (!nextLeague) {
    return {
      league,
      nextLeague: null,
      progressPercent: 100,
    }
  }

  const span = Math.max(1, nextLeague.minXp - league.minXp)
  const progress = Math.max(0, xp - league.minXp)
  const progressPercent = Math.min(100, Math.round((progress / span) * 100))

  return {
    league,
    nextLeague,
    progressPercent,
  }
}

export function getLeagueSoundEvent(xp: number): SoundEventKey | null {
  const league = getLeagueByXp(xp)
  if (league.rank >= 2) return 'level_up'
  return null
}
