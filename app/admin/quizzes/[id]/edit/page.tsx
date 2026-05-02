'use client'

import { SubmitEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

type QuizCategory = 'Radiography' | 'Sonography' // CHANGED: subject/category now matches the updated quiz model.
type QuizMode = 'exam' | 'cpd' // CHANGED: allowedModes uses exam/cpd for quiz availability.
type QuizTag = 'ARDMS' | 'Sonography Canada' | 'CAMRT' | 'ARRT' | 'CCI'

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

type QuizRow = {
  _id: string
  name: string
  description: string
  image?: string
  category: QuizCategory
  allowedModes: QuizMode[] // CHANGED: edit form now loads/saves shared availability modes.
  tags: QuizTag[]
  isPublished?: boolean
  questions: Array<string | { _id: string }>
}

const QUIZ_MODES: QuizMode[] = ['exam', 'cpd'] // CHANGED: checkbox group for allowedModes.
const QUIZ_CATEGORIES: QuizCategory[] = ['Radiography', 'Sonography']
const QUIZ_TAGS: QuizTag[] = [
  'ARDMS',
  'Sonography Canada',
  'CAMRT',
  'ARRT',
  'CCI',
]

export default function EditQuizPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const quizId = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState<QuizCategory>('Radiography')
  const [allowedModes, setAllowedModes] = useState<QuizMode[]>(['exam']) // CHANGED: quiz availability is now controlled by allowedModes.
  const [tags, setTags] = useState<QuizTag[]>([])
  const [isPublished, setIsPublished] = useState(false)
  const [questionIds, setQuestionIds] = useState<string[]>([])

  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [quizNameFilter, setQuizNameFilter] = useState('')
  // CHANGED: filter state was added to support searching loaded questions by quiz name without touching current selections.

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)

        const [quizRes, questionsRes] = await Promise.all([
          fetch(`/api/admin/quizzes/${quizId}`),
          fetch('/api/admin/questions'),
        ])

        const quizJson = (await quizRes.json()) as {
          success?: boolean
          message?: string
          data?: QuizRow
        }
        const questionsJson = (await questionsRes.json()) as {
          success?: boolean
          message?: string
          data?: QuestionRow[]
        }

        if (!quizRes.ok || !quizJson.success || !quizJson.data) {
          throw new Error(quizJson.message || 'Failed to load quiz')
        }
        if (!questionsRes.ok || !questionsJson.success) {
          throw new Error(questionsJson.message || 'Failed to load questions')
        }

        if (!mounted) return

        const q = quizJson.data
        const selected = q.questions.map((item) =>
          typeof item === 'string' ? item : item._id,
        )

        setName(q.name)
        setDescription(q.description)
        setImage(q.image ?? '')
        setCategory(q.category)
        setAllowedModes(q.allowedModes?.length ? q.allowedModes : ['exam']) // CHANGED: preserve saved allowedModes and fallback safely.
        setTags(q.tags ?? [])
        setIsPublished(Boolean(q.isPublished))
        setQuestionIds(selected)
        setQuestions(questionsJson.data ?? [])
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to load quiz')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadData()
    return () => {
      mounted = false
    }
  }, [quizId])

  const filteredQuestions = useMemo(() => {
    const filter = quizNameFilter.trim().toLowerCase()

    if (!filter) return questions

    return questions.filter((q) =>
      (q.quizName ?? '').toLowerCase().includes(filter),
    )
  }, [questions, quizNameFilter])
  // CHANGED: only the rendered list is filtered; the selected questionIds array remains untouched.

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
        isPublished,
      }

      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await res.json()) as { success?: boolean; message?: string }
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update quiz')
      }

      router.push('/admin/quizzes')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update quiz')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'>
        Loading...
      </main>
    )
  }

  return (
    <main className='space-y-4 sm:space-y-6'>
      {/* CHANGED: page header now wraps better on mobile. */}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
        <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>
          Edit Quiz
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

        <label className='inline-flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100'>
          <input
            type='checkbox'
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published
        </label>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
            Questions
          </label>

          <div className='space-y-2'>
            <input
              value={quizNameFilter}
              onChange={(e) => setQuizNameFilter(e.target.value)}
              placeholder='Filter questions by quiz name...'
              className='w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-100'
            />
            {/* CHANGED: search input added directly above the list so you can filter selectable questions by quiz name. */}
          </div>

          <div className='max-h-80 space-y-2 overflow-auto rounded border border-slate-300 p-3 dark:border-slate-700'>
            {filteredQuestions.length === 0 ? (
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                No questions match the current quiz name filter.
              </p>
            ) : (
              filteredQuestions.map((q) => (
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
              ))
            )}
          </div>
        </div>

        <button
          type='submit'
          disabled={saving}
          className='rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900'
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  )
}
