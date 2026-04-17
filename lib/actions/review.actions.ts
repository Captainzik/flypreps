'use server'

import { connectToDatabase } from '@/lib/db'
import { Review } from '@/lib/db/models/review.model'
import { Quiz } from '@/lib/db/models/quiz.model'
import { User } from '@/lib/db/models/user.model'
import { CreateReviewSchema } from '@/lib/validator'
import { revalidatePath } from 'next/cache'

export type CreateQuizReviewInput = {
  quizId: string
  userId: string
  title: string
  comment: string
  rating: number
}

export async function createQuizReview(input: CreateQuizReviewInput) {
  await connectToDatabase()

  const parsed = CreateReviewSchema.parse({
    quiz: input.quizId,
    user: input.userId,
    title: input.title.trim(),
    comment: input.comment.trim(),
    rating: input.rating,
  })

  const quizExists = await Quiz.findById(parsed.quiz).select('_id').lean()
  if (!quizExists) {
    throw new Error('Quiz not found')
  }

  const userExists = await User.findById(parsed.user).select('_id').lean()
  if (!userExists) {
    throw new Error('User not found')
  }

  const existingReview = await Review.findOne({
    quiz: parsed.quiz,
    user: parsed.user,
  })
    .select('_id')
    .lean()

  if (existingReview) {
    throw new Error('You have already reviewed this quiz')
  }

  const review = await Review.create(parsed)

  revalidatePath('/quiz')
  revalidatePath('/quiz/history')
  revalidatePath('/feed')
  revalidatePath(`/quiz/${input.quizId}`)
  revalidatePath(`/quiz/attempt/${input.quizId}`)
  revalidatePath(`/quiz/attempt/${input.quizId}/result`)

  return {
    success: true,
    review: {
      _id: review._id.toString(),
      quiz: review.quiz.toString(),
      user: review.user.toString(),
      title: review.title,
      comment: review.comment,
      rating: review.rating,
      createdAt: review.createdAt,
    },
  }
}

export async function hasUserReviewedQuiz(params: {
  quizId: string
  userId: string
}) {
  await connectToDatabase()

  const review = await Review.findOne({
    quiz: params.quizId,
    user: params.userId,
  })
    .select('_id rating title comment createdAt')
    .lean()

  return {
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
  }
}
