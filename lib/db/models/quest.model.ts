import { HydratedDocument, Model, model, models, Schema } from 'mongoose'
import type { QuizMode } from '@/lib/modes/types' // CHANGED: quests can be scoped to exam or CPD mode.

export type QuestScope = 'daily' | 'weekly' | 'monthly' | 'friend' | 'seasonal'

export interface IQuestReward {
  hearts: number
  gems: number
  xp: number
}

export interface IQuest {
  title: string
  description: string
  scope: QuestScope
  mode?: QuizMode
  targetCount: number
  reward: IQuestReward
  startsAt?: Date
  endsAt?: Date
  isActive: boolean
  requiresFriend?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type IQuestDocument = HydratedDocument<IQuest>

const QuestRewardSchema = new Schema<IQuestReward>(
  {
    hearts: {
      type: Number,
      default: 0,
      min: 0,
    },
    gems: {
      type: Number,
      default: 0,
      min: 0,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
)

const QuestSchema = new Schema<IQuest>(
  {
    title: {
      type: String,
      required: [true, 'Quest title is required'],
      trim: true,
      minlength: [3, 'Quest title is too short'],
      maxlength: [100, 'Quest title is too long'],
    },
    description: {
      type: String,
      required: [true, 'Quest description is required'],
      trim: true,
      minlength: [10, 'Quest description is too short'],
      maxlength: [500, 'Quest description is too long'],
    },
    scope: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'friend', 'seasonal'],
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ['exam', 'cpd'],
      index: true,
    },
    targetCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    reward: {
      type: QuestRewardSchema,
      default: () => ({
        hearts: 0,
        gems: 0,
        xp: 0,
      }),
    },
    startsAt: {
      type: Date,
    },
    endsAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    requiresFriend: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

QuestSchema.index({ scope: 1, isActive: 1 })
QuestSchema.index({ mode: 1, isActive: 1 })
QuestSchema.index({ endsAt: 1 })

QuestSchema.pre('save', function (this: IQuestDocument) {
  if (
    this.startsAt &&
    this.endsAt &&
    this.endsAt.getTime() < this.startsAt.getTime()
  ) {
    this.invalidate('endsAt', 'Quest end date must be after start date')
  }
})

export const Quest: Model<IQuest> =
  (models.Quest as Model<IQuest>) || model<IQuest>('Quest', QuestSchema)
