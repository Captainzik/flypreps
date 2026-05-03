import { connectToDatabase, QuizAttempt } from './quizAttempt.shared'
import { getActiveAttemptTimerState } from '@/lib/learning/timing'

type ActiveAttemptQuestion = {
  questionId: string
  questionText: string
  image?: string
  options: {
    text?: string
    image?: string
  }[]
  selectedOptionIndex?: number
}

export async function getActiveQuizAttempt(params: {
  attemptId: string
  userId: string
}) {
  await connectToDatabase()

  const attempt = await QuizAttempt.findOne({
    _id: params.attemptId,
    user: params.userId,
  })
    .populate({
      path: 'quiz',
      select: 'name category image',
    })
    .populate({
      path: 'answers.question',
      select: 'question image options',
    })
    .lean()

  if (!attempt || attempt.completed) return null

  const quizObj = attempt.quiz as unknown as {
    _id: import('mongoose').Types.ObjectId
    name: string
    category: string
    image?: string
  }

  const questions: ActiveAttemptQuestion[] = (attempt.answers || []).map(
    (a) => {
      const q = a.question as unknown as {
        _id: import('mongoose').Types.ObjectId
        question: string
        image?: string
        options: Array<{ text?: string; image?: string; isCorrect?: boolean }>
      }

      return {
        questionId: q?._id?.toString?.() ?? '',
        questionText: q?.question ?? '',
        image: q?.image ?? '',
        options: (q?.options || []).map((o) => ({
          text: o?.text ?? '',
          image: o?.image ?? '',
        })),
        selectedOptionIndex: a.selectedOptionIndex,
      }
    },
  )

  const currentQuestionIndex = Math.min(
    Number(attempt.currentQuestionIndex ?? 0),
    Math.max(questions.length, 0),
  ) // CHANGED: use stored progress pointer only; no answered-count navigation.

  const currentQuestion = questions[currentQuestionIndex] ?? undefined // CHANGED: direct index lookup only.

  const timerState = getActiveAttemptTimerState({
    mode: attempt.mode,
    startedAt: attempt.startedAt,
    totalQuestions: questions.length,
  })

  return {
    _id: attempt._id,
    mode: attempt.mode,
    status: attempt.status,
    resultVisibility: attempt.resultVisibility,
    startedAt: attempt.startedAt,
    timeTakenMs: attempt.timeTakenMs,
    questionTimeLimitMs: attempt.questionTimeLimitMs,
    checkpointDeadlineMs: attempt.checkpointDeadlineMs,
    showTimer: timerState.showTimer,
    timerState: timerState.showTimer ? timerState : undefined,
    questions,
    currentQuestionIndex, // CHANGED: explicitly expose the current index.
    currentQuestion, // CHANGED: explicitly expose the current question.
    quiz: {
      id: quizObj?._id?.toString?.() ?? '',
      name: quizObj?.name ?? 'Quiz',
      category: quizObj?.category ?? '',
      image: quizObj?.image ?? '',
    },
    answers: (attempt.answers || []).map((a) => ({
      questionId:
        (
          a.question as unknown as { _id?: import('mongoose').Types.ObjectId }
        )?._id?.toString?.() ?? '',
      selectedOptionIndex: a.selectedOptionIndex,
    })),
    completed: attempt.completed,
  }
}
