import { connectToDatabase, QuizAttempt } from './quizAttempt.shared'

export async function submitAnswerToAttempt(input: {
  attemptId: string
  userId: string
  questionId: string
  selectedOptionIndex: number
  timeSpentMs?: number
}) {
  await connectToDatabase()

  const {
    attemptId,
    userId,
    questionId,
    selectedOptionIndex,
    timeSpentMs = 0,
  } = input

  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    user: userId,
  })

  if (!attempt) throw new Error('Attempt not found')
  if (attempt.completed) throw new Error('Attempt already completed')

  const answerIndex = attempt.answers.findIndex(
    (a) => a.question.toString() === questionId,
  )

  if (answerIndex === -1) {
    throw new Error('Question does not belong to this attempt')
  }

  attempt.answers[answerIndex].selectedOptionIndex = selectedOptionIndex
  attempt.answers[answerIndex].timeSpentMs = timeSpentMs

  attempt.questionsAnswered = attempt.answers.filter(
    (a) => typeof a.selectedOptionIndex === 'number',
  ).length // CHANGED: keep count in sync for persistence, but CPD navigation no longer uses it.

  attempt.currentQuestionIndex = answerIndex + 1 // CHANGED: move to the next question by index only.

  if (attempt.currentQuestionIndex >= attempt.answers.length) {
    attempt.currentQuestionIndex = attempt.answers.length // CHANGED: boundary marker for completion; page will redirect to result.
  }

  await attempt.save()

  return {
    attemptId: attempt._id.toString(),
    questionsAnswered: attempt.questionsAnswered,
    totalQuestions: attempt.answers.length,
    currentQuestionIndex: attempt.currentQuestionIndex, // CHANGED: expose the next pointer to callers.
    completed: attempt.completed,
  }
}
