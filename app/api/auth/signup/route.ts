import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { User } from '@/lib/db/models/user.model'
import { CreateUserSchema } from '@/lib/validator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateUserSchema.parse(body)

    const existingEmail = await User.findOne({ email: parsed.email }).lean()
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 409 },
      )
    }

    if (parsed.username) {
      const existingUsername = await User.findOne({
        username: parsed.username,
      }).lean()
      if (existingUsername) {
        return NextResponse.json(
          { success: false, message: 'Username already in use' },
          { status: 409 },
        )
      }
    }

    const hashed = await bcrypt.hash(parsed.password, 12)

    const user = await User.create({
      email: parsed.email,
      username: parsed.username,
      password: hashed,
      fullName: parsed.fullName,
      avatar: parsed.avatar || '',
      role: 'user',
      isVerified: false,
      favoriteCategories: [],
      lifetimeTotalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Signup failed',
      },
      { status: 400 },
    )
  }
}
