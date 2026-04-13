import { HydratedDocument, Model, model, models, Schema } from 'mongoose'

export interface IUser {
  email: string
  username?: string
  password?: string
  fullName?: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  isVerified: boolean
  favoriteCategories: string[]
  lifetimeTotalScore: number
  lastActive?: Date
  createdAt?: Date
  updatedAt?: Date
  currentStreak: number
  longestStreak: number
  lastStreakDate?: Date
}

export type IUserDocument = HydratedDocument<IUser>

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    username: {
      type: String,
      trim: true,
      minlength: [3, 'Username too short'],
      maxlength: [30, 'Username too long'],
      unique: true,
      sparse: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    avatar: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) =>
          !v || /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(v),
        message: 'Invalid avatar URL',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    favoriteCategories: {
      type: [
        {
          type: String,
          enum: ['ARDMS', 'Sonography Canada', 'CAMRT', 'ARRT', 'CPD'],
        },
      ],
      default: [],
    },
    lifetimeTotalScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastStreakDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password
        return ret
      },
      virtuals: true,
    },
    toObject: { virtuals: true },
  },
)

// Keep non-duplicate indexes only.
// NOTE: email + username indexes are already defined at field level above.
UserSchema.index({ role: 1 })
UserSchema.index({ lifetimeTotalScore: -1, role: 1 })
UserSchema.index({ lastActive: -1 })
UserSchema.index({ currentStreak: -1 })

UserSchema.virtual('reviewCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
  count: true,
})

UserSchema.pre('save', function (this: IUserDocument) {
  this.lastActive = new Date()
})

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>('User', UserSchema)
