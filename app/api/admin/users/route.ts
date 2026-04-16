import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import bcrypt from 'bcryptjs'
import { requireApiAdmin } from '@/lib/auth/api-guards'
import { User } from '@/lib/db/models/user.model'
import { connectToDatabase } from '@/lib/db'

const CreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().trim().min(3).max(30).optional(),
  fullName: z.string().trim().max(100).optional(),
  password: z.string().min(8).max(128),
  avatar: z.string().url().optional().or(z.literal('')),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  isVerified: z.boolean().default(true),
})

export async function GET() {
  await connectToDatabase()
  const guard = await requireApiAdmin()
  if (!guard.ok) return guard.response

  const users = await User.find({})
    .sort({ createdAt: -1 })
    .select(
      '_id email username fullName avatar role isVerified favoriteCategories lifetimeTotalScore currentStreak longestStreak createdAt updatedAt',
    )
    .lean()

  return NextResponse.json({ success: true, data: users }, { status: 200 })
}

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const guard = await requireApiAdmin()
  if (!guard.ok) return guard.response

  try {
    const raw = await req.json()
    const payload = CreateUserSchema.parse(raw)

    const normalizedEmail = payload.email.toLowerCase().trim()
    const username = payload.username?.trim() || undefined

    const emailExists = await User.exists({ email: normalizedEmail })
    if (emailExists) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 },
      )
    }

    if (username) {
      const usernameExists = await User.exists({ username })
      if (usernameExists) {
        return NextResponse.json(
          { success: false, message: 'Username already exists' },
          { status: 409 },
        )
      }
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10)

    const created = await User.create({
      email: normalizedEmail,
      username,
      fullName: payload.fullName?.trim() || undefined,
      password: hashedPassword,
      avatar: payload.avatar || '',
      role: payload.role,
      isVerified: payload.isVerified,
      favoriteCategories: [],
      lifetimeTotalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
    })

    const safe = await User.findById(created._id)
      .select(
        '_id email username fullName avatar role isVerified favoriteCategories lifetimeTotalScore currentStreak longestStreak createdAt updatedAt',
      )
      .lean()

    return NextResponse.json({ success: true, data: safe }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', details: error.issues },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
