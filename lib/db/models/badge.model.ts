import { HydratedDocument, Model, model, models, Schema, Types } from 'mongoose'
import type { BadgeType } from '@/lib/gamification/badges' // CHANGED: badges are tied to the shared badge enum.

export interface IBadge {
  badgeId: BadgeType
  title: string
  description: string
  mode?: 'exam' | 'cpd'
  icon?: string
  color?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IUserBadge {
  user: Types.ObjectId
  badge: Types.ObjectId
  earnedAt: Date
  source?: string
  meta?: Record<string, unknown>
  createdAt?: Date
  updatedAt?: Date
}

export type IBadgeDocument = HydratedDocument<IBadge>
export type IUserBadgeDocument = HydratedDocument<IUserBadge>

const BadgeSchema = new Schema<IBadge>(
  {
    badgeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Badge title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
      trim: true,
      maxlength: 300,
    },
    mode: {
      type: String,
      enum: ['exam', 'cpd'],
      index: true,
    },
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

BadgeSchema.index({ mode: 1, isActive: 1 })

const UserBadgeSchema = new Schema<IUserBadge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: '',
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true })
UserBadgeSchema.index({ user: 1, earnedAt: -1 })

export const Badge: Model<IBadge> =
  (models.Badge as Model<IBadge>) || model<IBadge>('Badge', BadgeSchema)

export const UserBadge: Model<IUserBadge> =
  (models.UserBadge as Model<IUserBadge>) ||
  model<IUserBadge>('UserBadge', UserBadgeSchema)
