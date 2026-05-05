'use client'

import { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QuizActiveAttemptShell } from '@/components/learning/quiz-active-attempt-shell'

type AttemptQuestion = {
  questionId: string
  questionText: string
  image?: string
  options: {
    text?: string
    image?: string
  }[]
}

type QuizExamAttemptClientProps = {
  attemptId: string
  mode: 'exam' | 'cpd'
  startedAt: string
  quizName: string
  quizCategory: string
  questionNumber: number
  totalQuestions: number
  question: AttemptQuestion
  action: string
  showTimer?: boolean // CHANGED: allow the page to control timer visibility explicitly.
  onExpireAction?: 'complete' | 'none' // CHANGED: makes timer-expiry behavior explicit.
}

export function QuizExamAttemptClient({
  attemptId,
  mode,
  startedAt,
  quizName,
  quizCategory,
  questionNumber,
  totalQuestions,
  question,
  action,
  showTimer = mode === 'exam', // CHANGED: default remains exam-only timer visibility.
  onExpireAction = mode === 'exam' ? 'complete' : 'none', // CHANGED: default expiry behavior stays exam-specific.
}: QuizExamAttemptClientProps) {
  const router = useRouter()
  const handledRef = useRef(false) // CHANGED: prevents duplicate POSTs and redirects.

  const handleExpire = useCallback(async () => {
    if (handledRef.current || onExpireAction !== 'complete') return // CHANGED: expiry action is now explicit.
    handledRef.current = true // CHANGED: lock before making the network request.

    try {
      const res = await fetch(`/exam/attempt/${attemptId}/complete`, {
        method: 'POST',
      })

      if (!res.ok) {
        handledRef.current = false // CHANGED: allow retry if the request fails.
        return
      }

      router.replace(`/exam/attempt/${attemptId}/result`) // CHANGED: redirect only after completion succeeds.
      router.refresh()
    } catch {
      handledRef.current = false // CHANGED: allow retry on network errors.
    }
  }, [attemptId, onExpireAction, router])

  return (
    <QuizActiveAttemptShell
      mode={mode}
      startedAt={new Date(startedAt)} // CHANGED: pass the server timestamp directly; no ref needed during render.
      quizName={quizName}
      quizCategory={quizCategory}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      question={question}
      action={action}
      showTimer={showTimer} // CHANGED: timer visibility is now configurable and aligned with the mode.
      onExpire={handleExpire} // CHANGED: timer expiry now triggers the safe client-side completion flow.
    />
  )
}
