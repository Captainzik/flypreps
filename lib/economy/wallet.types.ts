import type { QuizMode, SoundEventKey } from '@/lib/modes/types' // CHANGED: economy actions may emit sound events after balance changes.

export type CurrencyType = 'hearts' | 'gems' | 'xp'

export type WalletBalance = {
  hearts: number
  gems: number
  xp: number
  premium: boolean
  lastHeartRefillAt?: Date
  lastAdRewardAt?: Date
  lastXPAwardAt?: Date
  soundEventQueue?: SoundEventKey[] // CHANGED: wallet changes may trigger reward sounds.
}

export type SpendCurrencyInput = {
  userId: string
  currency: CurrencyType
  amount: number
  reason: string
  mode?: QuizMode
}

export type GrantCurrencyInput = {
  userId: string
  currency: CurrencyType
  amount: number
  reason: string
  mode?: QuizMode
}

export type HeartEconomyRules = {
  maxHearts: number
  refillPerAd: number
  adCapPerDay: number
  premiumUnlimitedHearts: boolean
}

export type GemEconomyRules = {
  referralBonus: number
  giftLimitPerDay: number
  heartExchangeRate: number
}

export type XPRewardInput = {
  baseXp: number
  bonusXp?: number
  mode: QuizMode
  completedAt: Date
  soundEvent?: SoundEventKey // CHANGED: XP-award flow can optionally enqueue audio.
}
