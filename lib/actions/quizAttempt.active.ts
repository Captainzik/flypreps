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
  expectedMode?: 'exam' | 'cpd'
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

  if (params.expectedMode && attempt.mode !== params.expectedMode) {
    // CHANGED: fail fast if the attempt is loaded through the wrong route.
    throw new Error(
      `Attempt mode mismatch: expected ${params.expectedMode}, got ${attempt.mode}`,
    )
  }

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

  const answeredCount = (attempt.answers || []).filter(
    (a) => typeof a.selectedOptionIndex === 'number',
  ).length

  const checkpointIndex = Math.max(
    0,
    Math.min(Number(attempt.checkpointIndex ?? 0), questions.length - 1),
  ) // CHANGED: use checkpointIndex as the resume anchor instead of currentQuestionIndex.

  const currentQuestionIndex = Number(
    attempt.currentQuestionIndex ?? checkpointIndex,
  ) // CHANGED: keep currentQuestionIndex as metadata, but fall back to checkpointIndex for compatibility.
  const currentQuestion = questions[checkpointIndex] ?? undefined // CHANGED: render the resumed question from the stored checkpoint boundary.

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
    checkpointIndex, // CHANGED: explicitly expose the checkpoint boundary for resume rendering.
    showTimer: timerState.showTimer,
    timerState: timerState.showTimer ? timerState : undefined,
    questions,
    currentQuestionIndex, // CHANGED: retained as progress metadata only.
    currentQuestion, // CHANGED: this now reflects the checkpoint-based resume question.
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
    answeredCount, // CHANGED: retained for display/diagnostics, not resume logic.
    completed: attempt.completed,
  }
}
