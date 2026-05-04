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
}: QuizExamAttemptClientProps) {
  const router = useRouter()
  const handledRef = useRef(false) // CHANGED: prevents duplicate POSTs and redirects.

  const handleExpire = useCallback(async () => {
    if (mode !== 'exam' || handledRef.current) return
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
  }, [attemptId, mode, router])

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
      showTimer={mode === 'exam'}
      onExpire={handleExpire} // CHANGED: timer expiry now triggers the safe client-side completion flow.
    />
  )
}
