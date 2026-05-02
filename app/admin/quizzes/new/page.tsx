'use client'

import { SubmitEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type QuestionOption = {
  text: string
  isCorrect: boolean
}

type QuestionRow = {
  _id: string
  question: string
  quizName?: string
  isPublished?: boolean
  options?: QuestionOption[]
}

type QuestionsResponse = {
  success?: boolean
  message?: string
  data?: QuestionRow[]
}

type QuizCategory = 'Radiography' | 'Sonography' // CHANGED: subject/category now matches the updated quiz model.
type QuizMode = 'exam' | 'cpd' // CHANGED: quiz availability is controlled by allowedModes.
type QuizTag = 'ARDMS' | 'Sonography Canada' | 'CAMRT' | 'ARRT' | 'CCI'

const QUIZ_MODES: QuizMode[] = ['exam', 'cpd'] // CHANGED: used by the new allowedModes checkbox group.
const QUIZ_CATEGORIES: QuizCategory[] = ['Radiography', 'Sonography']
const QUIZ_TAGS: QuizTag[] = [
  'ARDMS',
  'Sonography Canada',
  'CAMRT',
  'ARRT',
  'CCI',
]

export default function NewQuizPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState<QuizCategory>('Radiography')
  const [allowedModes, setAllowedModes] = useState<QuizMode[]>(['exam']) // CHANGED: quizzes can be shared across exam/CPD and must belong to at least one mode.
  const [tags, setTags] = useState<QuizTag[]>([])
  const [questionIds, setQuestionIds] = useState<string[]>([])

  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [saving, setSaving] = useState(false)

  const [quizNameFilter, setQuizNameFilter] = useState('')
  // CHANGED: local quiz name search state added so the loaded question list can be filtered client-side without losing selections.

  useEffect(() => {
    let mounted = true

    async function loadQuestions() {
      try {
        setLoadingQuestions(true)
        const res = await fetch('/api/admin/questions')
        const json = (await res.json()) as QuestionsResponse
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to load questions')
        }
        if (!mounted) return
        setQuestions(json.data ?? [])
      } catch (error) {
        alert(
          error instanceof Error ? error.message : 'Failed to load questions',
        )
      } finally {
        if (mounted) setLoadingQuestions(false)
      }
    }

    void loadQuestions()
    return () => {
      mounted = false
    }
  }, [])

  const filteredQuestions = useMemo(() => {
    const filter = quizNameFilter.trim().toLowerCase()

    if (!filter) return questions

    return questions.filter((q) =>
      (q.quizName ?? '').toLowerCase().includes(filter),
    )
  }, [questions, quizNameFilter])
  // CHANGED: filtered list is derived from the already-loaded questions so selections stay intact while searching.

  function toggleTag(tag: QuizTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function toggleAllowedMode(mode: QuizMode) {
    setAllowedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    )
  } // CHANGED: added mode toggles so quizzes can be shared between exam and CPD.

  function toggleQuestion(id: string) {
    setQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id],
    )
  }

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    if (allowedModes.length === 0) {
      alert('Please select at least one mode.')
      return
    } // CHANGED: quiz must belong to at least one mode.

    if (questionIds.length === 0) {
      alert('Please select at least one question.')
      return
    }

    try {
      setSaving(true)

      const payload = {
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        category,
        allowedModes, // CHANGED: submit allowedModes instead of a single mode.
        tags,
        questions: questionIds,
      }

      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await res.json()) as { success?: boolean; message?: string }
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to create quiz')
      }

      router.push('/admin/quizzes')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create quiz')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className='space-y-4 sm:space-y-6'>
      {/* CHANGED: header section is more mobile-friendly and uses consistent card spacing. */}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
        <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>
          New Quiz
        </h1>
        <Link
          href='/admin/quizzes'
          className='rounded border border-slate-300 px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
        >
          Back
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className='space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'
      >
        <div className='space-y-2'>
          <label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={100}
            className='w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-100'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            className='w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-100'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
            Image URL (optional)
          </label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder='https://...'
            className='w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-100'
          />
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QuizCategory)}
              className='w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-100'
            >
              {QUIZ_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
              Allowed Modes
            </label>
            <div className='flex flex-wrap gap-2'>
              {QUIZ_MODES.map((mode) => (
                <label
                  key={mode}
                  className='inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                >
                  <input
                    type='checkbox'
                    checked={allowedModes.includes(mode)}
                    onChange={() => toggleAllowedMode(mode)}
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          <div className='space-y-2 md:col-span-2'>
            <label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
              Tags
            </label>
            <div className='flex flex-wrap gap-2'>
              {QUIZ_TAGS.map((tag) => (
                <label
                  key={tag}
                  className='inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                >
                  <input
                    type='checkbox'
                    checked={tags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
            Questions (select one or more)
          </label>

          <div className='space-y-2'>
            <input
              value={quizNameFilter}
              onChange={(e) => setQuizNameFilter(e.target.value)}
              placeholder='Filter questions by quiz name...'
              className='w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-100'
            />
            {/* CHANGED: quiz name filter sits above the list so you can narrow questions without affecting selected questionIds. */}
          </div>

          {loadingQuestions ? (
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Loading questions...
            </p>
          ) : filteredQuestions.length === 0 ? (
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              No questions match the current quiz name filter.
            </p>
          ) : (
            <div className='max-h-80 space-y-2 overflow-auto rounded border border-slate-300 p-3 dark:border-slate-700'>
              {filteredQuestions.map((q) => (
                <label
                  key={q._id}
                  className='flex cursor-pointer items-start gap-2 rounded border border-slate-300 p-2 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                >
                  <input
                    type='checkbox'
                    checked={questionIds.includes(q._id)}
                    onChange={() => toggleQuestion(q._id)}
                    className='mt-1'
                  />
                  <div>
                    <p className='text-sm font-medium text-slate-900 dark:text-white'>
                      {q.question}
                    </p>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Quiz: {q.quizName ?? 'N/A'} • Published:{' '}
                      {q.isPublished ? 'Yes' : 'No'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type='submit'
          disabled={saving}
          className='rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900'
        >
          {saving ? 'Creating...' : 'Create Quiz'}
        </button>
      </form>
    </main>
  )
}
