import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Clock, Send, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { saveWritingSubmission } from '../lib/submissions'
import { supabase } from '../lib/supabase'

const MOCK_TESTS = {
  '1': {
    title: 'Writing 모의고사 1회',
    durationMin: 60,
    task1: {
      type: 'task1',
      title: 'Task 1',
      minWords: 150,
      timeGuide: '권장 20분',
      prompt: `The chart below shows the percentage of households in different income brackets in a country in 2010 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    },
    task2: {
      type: 'task2',
      title: 'Task 2',
      minWords: 250,
      timeGuide: '권장 40분',
      prompt: `Some people believe that universities should focus on providing academic skills, while others think they should prepare students for their future careers.

Discuss both views and give your own opinion.

Write at least 250 words.`,
    },
  },
}

const STORAGE_KEY = (id, userId) => `mockTestWriting:${id}:${userId}`

export default function MockTestWriting() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, hasCredits, refreshProfile } = useAuth()
  const test = MOCK_TESTS[id]

  const [activeTask, setActiveTask] = useState('task1')
  const [task1Essay, setTask1Essay] = useState('')
  const [task2Essay, setTask2Essay] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const submittedRef = useRef(false)

  // 상태 복원 (페이지 새로고침 대비)
  useEffect(() => {
    if (!user || !test) return
    const saved = localStorage.getItem(STORAGE_KEY(id, user.id))
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setStartedAt(parsed.startedAt)
        setTask1Essay(parsed.task1Essay || '')
        setTask2Essay(parsed.task2Essay || '')
      } catch {
        const start = Date.now()
        setStartedAt(start)
      }
    } else {
      const start = Date.now()
      setStartedAt(start)
      localStorage.setItem(STORAGE_KEY(id, user.id), JSON.stringify({
        startedAt: start, task1Essay: '', task2Essay: '',
      }))
    }
  }, [user, id, test])

  // 진행상황 저장
  useEffect(() => {
    if (!user || !startedAt) return
    localStorage.setItem(STORAGE_KEY(id, user.id), JSON.stringify({
      startedAt, task1Essay, task2Essay,
    }))
  }, [task1Essay, task2Essay, startedAt, user, id])

  // 1초마다 시간 갱신
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const totalMs = test ? test.durationMin * 60 * 1000 : 0
  const elapsed = startedAt ? now - startedAt : 0
  const remaining = Math.max(0, totalMs - elapsed)
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  const isOvertime = remaining === 0
  const isWarning = remaining > 0 && remaining <= 5 * 60 * 1000

  const wordCount = (text) => text.split(/\s+/).filter(Boolean).length
  const t1Words = wordCount(task1Essay)
  const t2Words = wordCount(task2Essay)

  const handleSubmit = async (forced = false) => {
    if (submittedRef.current) return
    if (!user) { navigate('/login'); return }

    if (!forced) {
      if (!task1Essay.trim() && !task2Essay.trim()) {
        setError('최소 한 개 이상의 Task를 작성해야 제출할 수 있어요.')
        return
      }
    }

    submittedRef.current = true
    setSubmitting(true)
    setError('')

    try {
      // 작성한 Task만 제출, 빈 Task는 빈 문자열로라도 제출(시간초과 강제제출 시)
      const submissions = []
      if (task1Essay.trim() || forced) {
        submissions.push({
          taskType: 'task1',
          essay: task1Essay,
          question: test.task1.prompt,
          isHomework: true,
          feedback: { overall_band: null, scores: { task_achievement: null, coherence_cohesion: null, lexical_resource: null, grammatical_range: null } },
        })
      }
      if (task2Essay.trim() || forced) {
        submissions.push({
          taskType: 'task2',
          essay: task2Essay,
          question: test.task2.prompt,
          isHomework: true,
          feedback: { overall_band: null, scores: { task_achievement: null, coherence_cohesion: null, lexical_resource: null, grammatical_range: null } },
        })
      }

      for (const s of submissions) {
        await saveWritingSubmission(user.id, s)
        await supabase.rpc('deduct_credit')
      }

      refreshProfile()
      localStorage.removeItem(STORAGE_KEY(id, user.id))
      setSubmitted(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      submittedRef.current = false
      setError(err.message || '제출에 실패했습니다. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  // 시간 만료 시 자동 강제제출
  useEffect(() => {
    if (isOvertime && startedAt && !submittedRef.current && !submitted) {
      handleSubmit(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOvertime, startedAt])

  if (!test) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary mb-4">존재하지 않는 모의고사입니다.</p>
        <Link to="/mock-test" className="text-primary no-underline">모의고사 목록으로</Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary mb-4">로그인 후 응시할 수 있어요.</p>
        <Link to="/login" className="text-primary no-underline">로그인</Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <CheckCircle2 size={56} className="text-success mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">제출 완료!</h2>
        <p className="text-sm text-text-secondary">
          선생님이 곧 채점해 드릴게요. 잠시 후 홈으로 이동합니다.
        </p>
      </div>
    )
  }

  const currentTask = activeTask === 'task1' ? test.task1 : test.task2
  const currentEssay = activeTask === 'task1' ? task1Essay : task2Essay
  const setCurrentEssay = activeTask === 'task1' ? setTask1Essay : setTask2Essay
  const currentWords = activeTask === 'task1' ? t1Words : t2Words

  return (
    <div className="max-w-3xl mx-auto pb-32">
      <Link
        to="/mock-test"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> 모의고사 목록
      </Link>

      {/* 헤더 + 타이머 */}
      <div className="sticky top-14 z-40 bg-bg/95 backdrop-blur py-3 mb-4 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold leading-tight">{test.title}</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              총 {test.durationMin}분 · Task 1 + Task 2 자유 작성
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${
            isOvertime ? 'bg-red-100 text-red-600' :
            isWarning ? 'bg-amber-100 text-amber-700' :
            'bg-primary/10 text-primary'
          }`}>
            <Clock size={18} />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Task 토글 */}
      <div className="flex gap-2 mb-4">
        {['task1', 'task2'].map((key) => {
          const t = key === 'task1' ? test.task1 : test.task2
          const w = key === 'task1' ? t1Words : t2Words
          const isActive = activeTask === key
          const isComplete = w >= t.minWords
          return (
            <button
              key={key}
              onClick={() => setActiveTask(key)}
              className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface text-text border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{t.title}</span>
                {isComplete && (
                  <CheckCircle2 size={14} className={isActive ? 'text-white' : 'text-success'} />
                )}
              </div>
              <p className={`text-[11px] mt-0.5 ${isActive ? 'text-white/80' : 'text-text-secondary'}`}>
                {w} / {t.minWords}+ words · {t.timeGuide}
              </p>
            </button>
          )
        })}
      </div>

      {/* 문제 */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-4">
        <p className="text-xs text-text-secondary mb-2 font-medium">문제 (Question)</p>
        <p className="text-sm text-text whitespace-pre-line leading-relaxed">
          {currentTask.prompt}
        </p>
      </div>

      {/* 에세이 입력 */}
      <textarea
        value={currentEssay}
        onChange={(e) => setCurrentEssay(e.target.value)}
        placeholder={`${currentTask.title} 에세이를 입력하세요...`}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={submitting || isOvertime}
        className="w-full h-96 p-4 rounded-xl border border-border bg-surface resize-y text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
      />

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className={currentWords >= currentTask.minWords ? 'text-success' : 'text-text-secondary'}>
          {currentWords} / {currentTask.minWords}+ words
        </span>
        <span className="text-text-secondary">
          크레딧 {profile?.credits ?? 0} · 제출 시 Task당 1 크레딧 차감
        </span>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      {/* 하단 sticky 제출 버튼 */}
      <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
        <div className="max-w-3xl mx-auto bg-surface border border-border rounded-2xl shadow-lg p-3 flex items-center justify-between gap-3">
          <div className="text-xs text-text-secondary">
            <p>Task 1: {t1Words}w · Task 2: {t2Words}w</p>
            {isWarning && (
              <p className="text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                <AlertTriangle size={12} /> 5분 이내 종료
              </p>
            )}
          </div>
          {!confirmSubmit ? (
            <button
              onClick={() => setConfirmSubmit(true)}
              disabled={submitting || (!task1Essay.trim() && !task2Essay.trim())}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} /> 최종 제출
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmSubmit(false)}
                disabled={submitting}
                className="px-3 py-2 text-sm text-text-secondary hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-error text-white rounded-xl font-medium text-sm hover:bg-error/90 disabled:opacity-50 transition-colors"
              >
                <Send size={14} /> {submitting ? '제출 중...' : '확인 — 제출'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
