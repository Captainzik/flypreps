import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import { Review } from '@/lib/db/models/review.model'
import { Quiz } from '@/lib/db/models/quiz.model'
import { User } from '@/lib/db/models/user.model'
import { CreateReviewSchema } from '@/lib/validator'

type ReviewResponse = {
  _id: string
  quiz: string
  user: string
  title: string
  comment: string
  rating: number
  createdAt?: Date
  updatedAt?: Date
}

type ReviewLookupResponse = {
  hasReviewed: boolean
  review: {
    _id: string
    rating: number
    title: string
    comment: string
    createdAt?: Date
  } | null
}

type CreateReviewBody = {
  quizId?: string
  title?: string
  comment?: string
  rating?: number
}

type UpdateReviewBody = {
  reviewId?: string
  title?: string
  comment?: string
  rating?: number
}

type DeleteReviewBody = {
  reviewId?: string
}

export async function GET(req: NextRequest) {
  await connectToDatabase()

  try {
    const quizId = req.nextUrl.searchParams.get('quizId')
    const userId = req.nextUrl.searchParams.get('userId')

    if (!quizId || !userId) {
      return NextResponse.json<ReviewLookupResponse>(
        { hasReviewed: false, review: null },
        { status: 400 },
      )
    }

    const review = await Review.findOne({ quiz: quizId, user: userId })
      .select('_id rating title comment createdAt')
      .lean()

    return NextResponse.json<ReviewLookupResponse>({
      hasReviewed: Boolean(review),
      review: review
        ? {
            _id: review._id.toString(),
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            createdAt: review.createdAt,
          }
        : null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch review state'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase()

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const body = (await req.json().catch(() => ({}))) as CreateReviewBody

    if (
      !body.quizId ||
      !body.title ||
      !body.comment ||
      typeof body.rating !== 'number'
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required review fields' },
        { status: 400 },
      )
    }

    const parsed = CreateReviewSchema.parse({
      quiz: body.quizId,
      user: session.user.id,
      title: body.title,
      comment: body.comment,
      rating: body.rating,
    })

    const quizExists = await Quiz.findById(parsed.quiz).select('_id').lean()
    if (!quizExists) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 },
      )
    }

    const userExists = await User.findById(parsed.user).select('_id').lean()
    if (!userExists) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      )
    }

    const existingReview = await Review.findOne({
      quiz: parsed.quiz,
      user: parsed.user,
    }).lean()

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this quiz' },
        { status: 409 },
      )
    }

    const review = await Review.create(parsed)

    return NextResponse.json<{ success: boolean; data: ReviewResponse }>(
      {
        success: true,
        data: {
          _id: review._id.toString(),
          quiz: review.quiz.toString(),
          user: review.user.toString(),
          title: review.title,
          comment: review.comment,
          rating: review.rating,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create review'

    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase()

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const body = (await req.json().catch(() => ({}))) as UpdateReviewBody

    if (!body.reviewId) {
      return NextResponse.json(
        { success: false, message: 'reviewId is required' },
        { status: 400 },
      )
    }

    const review = await Review.findOne({
      _id: body.reviewId,
      user: session.user.id,
    })

    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 },
      )
    }

    if (typeof body.title === 'string') review.title = body.title.trim()
    if (typeof body.comment === 'string') review.comment = body.comment.trim()
    if (typeof body.rating === 'number') review.rating = body.rating

    await review.save()

    return NextResponse.json<{ success: boolean; data: ReviewResponse }>(
      {
        success: true,
        data: {
          _id: review._id.toString(),
          quiz: review.quiz.toString(),
          user: review.user.toString(),
          title: review.title,
          comment: review.comment,
          rating: review.rating,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update review'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase()

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const body = (await req.json().catch(() => ({}))) as DeleteReviewBody

    if (!body.reviewId) {
      return NextResponse.json(
        { success: false, message: 'reviewId is required' },
        { status: 400 },
      )
    }

    const deleted = await Review.findOneAndDelete({
      _id: body.reviewId,
      user: session.user.id,
    })

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { success: true, message: 'Review deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete review'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
