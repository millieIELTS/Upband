import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Clock, Send, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { saveWritingSubmission } from '../lib/submissions'
import { supabase } from '../lib/supabase'
import Task1Chart from '../components/writing/Task1Chart'

// ───────────────────────────────────────────────────────────────────
// 10회차 모의고사 세트
// Task 1 차트 분포: Bar ×2 · Line ×1 · Pie ×1 · Table ×1 · Diagram ×1
//                  Map ×1 · Multi ×3 (전부 흑백)
// Task 2 유형: 모두 다른 주제/다른 질문 유형
// ───────────────────────────────────────────────────────────────────
function makeTest(n, { chartIndex, t1Prompt, t2Prompt }) {
  return {
    title: `Writing 모의고사 ${n}회`,
    durationMin: 60,
    task1: {
      type: 'task1',
      title: 'Task 1',
      minWords: 150,
      timeGuide: '권장 20분',
      chartIndex,
      prompt: t1Prompt + '\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
    },
    task2: {
      type: 'task2',
      title: 'Task 2',
      minWords: 250,
      timeGuide: '권장 40분',
      prompt: t2Prompt + '\n\nWrite at least 250 words.',
    },
  }
}

const MOCK_TESTS = {
  '1': makeTest(1, {
    chartIndex: 0, // Bar #1
    t1Prompt: `The bar chart below shows the number of students enrolled in three university programmes (Business, Engineering, and Art & Design) from 2015 to 2020.`,
    t2Prompt: `Some people believe that universities should focus on providing academic skills, while others think they should prepare students for their future careers.\n\nDiscuss both views and give your own opinion.`,
  }),
  '2': makeTest(2, {
    chartIndex: 1, // Line
    t1Prompt: `The line graph below shows the average monthly temperatures of three cities — London, Sydney, and Tokyo — over a year.`,
    t2Prompt: `Some people think that technology such as tablets and laptops should replace traditional teaching in schools.\n\nTo what extent do you agree or disagree?`,
  }),
  '3': makeTest(3, {
    chartIndex: 2, // Pie
    t1Prompt: `The two pie charts below show the sources of energy production in a country in 1985 and 2010.`,
    t2Prompt: `Air pollution has become a serious problem in many major cities around the world.\n\nWhat are the main causes of this problem, and what measures could be taken to solve it?`,
  }),
  '4': makeTest(4, {
    chartIndex: 3, // Table
    t1Prompt: `The table below shows the percentage of average household monthly spending in five different countries across five categories.`,
    t2Prompt: `In recent years, the number of people working from home has been steadily increasing.\n\nWhy is this trend happening, and what are the effects on family life?`,
  }),
  '5': makeTest(5, {
    chartIndex: 4, // Bar #2
    t1Prompt: `The bar chart below shows international tourist arrivals (in millions) in five countries in 2010, 2015, and 2020.`,
    t2Prompt: `International tourism has brought significant benefits to many countries, but it has also caused serious problems.\n\nDiscuss the advantages and disadvantages of international tourism.`,
  }),
  '6': makeTest(6, {
    chartIndex: 5, // Diagram
    t1Prompt: `The diagram below illustrates the main stages in the production of chocolate, from cacao pods to finished chocolate bars.`,
    t2Prompt: `Some people believe that university education should be free for all students, while others argue that students should pay for their own studies.\n\nTo what extent do you agree or disagree?`,
  }),
  '7': makeTest(7, {
    chartIndex: 6, // Map
    t1Prompt: `The two maps below show the town of Brookfield in 1990 and in 2020.`,
    t2Prompt: `Some people believe that individuals are responsible for their own health, while others think the government should take responsibility for the health of its citizens.\n\nDiscuss both views and give your own opinion.`,
  }),
  '8': makeTest(8, {
    chartIndex: 7, // Multi (Bar + Pie)
    t1Prompt: `The bar chart shows changes in obesity rates in the UK among men, women, and children between 2000 and 2020, and the pie chart shows the share of household food spending by category in 2020.`,
    t2Prompt: `Obesity rates are rising rapidly in many developed countries.\n\nWhat do you think are the main causes of this problem, and what solutions could governments and individuals adopt to tackle it?`,
  }),
  '9': makeTest(9, {
    chartIndex: 8, // Multi (Line + Table)
    t1Prompt: `The line graph shows the share of three age groups in Japan's population from 1980 to 2020, and the table shows the share of different household types in Japan in 1980 and 2020.`,
    t2Prompt: `Many people feel that traditional values and customs are gradually being lost in modern society.\n\nWhy is this happening? Do you think this is a positive or negative development?`,
  }),
  '10': makeTest(10, {
    chartIndex: 9, // Multi (Bar + Line)
    t1Prompt: `The bar chart shows the share of users of five social media platforms across three age groups, and the line graph shows the change in teenagers' average daily screen time from 2015 to 2023.`,
    t2Prompt: `Social media plays an increasingly important role in young people's lives.\n\nDiscuss the advantages and disadvantages of social media for young people.`,
  }),
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
  const [preflightState, setPreflightState] = useState('checking') // checking | already_submitted | expired_abandoned | ready
  const [retryError, setRetryError] = useState('')
  const [retryDeducting, setRetryDeducting] = useState(false)
  const submittedRef = useRef(false)
  const retryPaidRef = useRef(false) // 재응시 시 이미 크레딧 차감한 경우 중복 차감 방지

  // 사전 체크: 이미 응시한 기록이 있는지 DB 조회 + localStorage 만료여부 확인
  useEffect(() => {
    let cancelled = false
    async function preflight() {
      if (!user || !test) return

      // 1) DB에 이 모의고사 제출 기록이 있으면 차단
      const { data: priorSubs } = await supabase
        .from('writing_submissions')
        .select('id, feedback_json, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
      if (cancelled) return
      const alreadyDone = (priorSubs || []).some(s => s.feedback_json?.mock_test_id === id)
      if (alreadyDone) {
        setPreflightState('already_submitted')
        return
      }

      // 2) localStorage 복원 — 만료된 세션은 버림(자동 제출 금지)
      const saved = localStorage.getItem(STORAGE_KEY(id, user.id))
      const totalMs = test.durationMin * 60 * 1000
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const expired = Date.now() - parsed.startedAt >= totalMs
          const hasContent = (parsed.task1Essay || '').trim() || (parsed.task2Essay || '').trim()
          if (expired && !hasContent) {
            // 빈 채로 방치되어 만료된 세션 — 그냥 초기화
            localStorage.removeItem(STORAGE_KEY(id, user.id))
          } else if (expired && hasContent) {
            // 작성 내용은 있는데 시간이 지난 경우 — 사용자가 선택할 수 있게 표시
            setTask1Essay(parsed.task1Essay || '')
            setTask2Essay(parsed.task2Essay || '')
            setStartedAt(parsed.startedAt)
            setPreflightState('expired_abandoned')
            return
          } else {
            // 정상 복원
            setStartedAt(parsed.startedAt)
            setTask1Essay(parsed.task1Essay || '')
            setTask2Essay(parsed.task2Essay || '')
            setPreflightState('ready')
            return
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY(id, user.id))
        }
      }

      // 3) 새 세션 시작
      const start = Date.now()
      setStartedAt(start)
      localStorage.setItem(STORAGE_KEY(id, user.id), JSON.stringify({
        startedAt: start, task1Essay: '', task2Essay: '',
      }))
      setPreflightState('ready')
    }
    preflight()
    return () => { cancelled = true }
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

    // 빈 에세이는 강제제출이라도 저장하지 않음 (크레딧 차감 방지)
    if (!task1Essay.trim() && !task2Essay.trim()) {
      if (forced) {
        // 시간 만료 자동 제출인데 작성한 게 없음 — 그냥 초기화 후 목록으로
        localStorage.removeItem(STORAGE_KEY(id, user.id))
        submittedRef.current = true
        navigate('/mock-test')
        return
      }
      setError('최소 한 개 이상의 Task를 작성해야 제출할 수 있어요.')
      return
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
          mockTestId: id,
          feedback: { overall_band: null, scores: { task_achievement: null, coherence_cohesion: null, lexical_resource: null, grammatical_range: null } },
        })
      }
      if (task2Essay.trim() || forced) {
        submissions.push({
          taskType: 'task2',
          essay: task2Essay,
          question: test.task2.prompt,
          mockTestId: id,
          feedback: { overall_band: null, scores: { task_achievement: null, coherence_cohesion: null, lexical_resource: null, grammatical_range: null } },
        })
      }

      for (const s of submissions) {
        await saveWritingSubmission(user.id, s)
      }
      // 모의고사는 1 크레딧만 차감 (Task 1 + Task 2 합쳐서)
      // 재응시 시작 시 이미 차감했다면 중복 차감하지 않음
      if (submissions.length > 0 && !retryPaidRef.current) {
        await supabase.rpc('deduct_credit_with_reason', { p_reason: 'mock_test' })
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

  // 이미 응시한 모의고사를 재응시 — 확인 시 크레딧 1 차감하고 새 세션 시작
  const handleRetry = async () => {
    if (retryDeducting || !user) return
    if ((profile?.credits ?? 0) < 1) {
      setRetryError('크레딧이 부족해요. 관리자에게 문의해 주세요.')
      return
    }
    setRetryDeducting(true)
    setRetryError('')
    try {
      await supabase.rpc('deduct_credit_with_reason', { p_reason: 'mock_test' })
      await refreshProfile()
      retryPaidRef.current = true
      // 새 세션 시작
      localStorage.removeItem(STORAGE_KEY(id, user.id))
      setTask1Essay('')
      setTask2Essay('')
      const start = Date.now()
      setStartedAt(start)
      localStorage.setItem(STORAGE_KEY(id, user.id), JSON.stringify({
        startedAt: start, task1Essay: '', task2Essay: '',
      }))
      setPreflightState('ready')
    } catch (err) {
      setRetryError(err.message || '크레딧 차감에 실패했어요. 다시 시도해 주세요.')
      setRetryDeducting(false)
    }
  }

  // 시간 만료 시 자동 강제제출 (사전 체크 통과 후에만)
  useEffect(() => {
    if (preflightState !== 'ready') return
    if (isOvertime && startedAt && !submittedRef.current && !submitted) {
      handleSubmit(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOvertime, startedAt, preflightState])

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

  if (preflightState === 'checking') {
    return <div className="text-center py-16 text-text-secondary">불러오는 중...</div>
  }

  if (preflightState === 'already_submitted') {
    const notEnoughCredits = (profile?.credits ?? 0) < 1
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">이미 응시한 모의고사입니다</h2>
        <p className="text-sm text-text-secondary mb-2">
          Writing Mock Test {id}회는 이미 제출하셨어요.
        </p>
        <p className="text-sm text-text mb-1">
          다시 응시하시겠어요?
        </p>
        <p className="text-xs text-text-secondary mb-6">
          다시 응시하면 <b className="text-accent">1 크레딧이 차감</b>되고 새 세션이 시작돼요. (현재 잔액: {profile?.credits ?? 0})
        </p>
        {retryError && (
          <p className="text-sm text-error mb-4">{retryError}</p>
        )}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-gray-50"
          >
            아니요, 홈으로
          </button>
          <button
            onClick={handleRetry}
            disabled={retryDeducting || notEnoughCredits}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retryDeducting ? '차감 중...' : notEnoughCredits ? '크레딧 부족' : '네, 다시 응시하기 (−1)'}
          </button>
        </div>
      </div>
    )
  }

  if (preflightState === 'expired_abandoned') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">이전 시도가 시간 만료되었어요</h2>
        <p className="text-sm text-text-secondary mb-2">
          작성하신 내용이 남아 있어요. 지금 제출하시겠어요? (제출 시 1 크레딧 차감)
        </p>
        <p className="text-xs text-text-secondary mb-6">
          Task 1: {t1Words}w · Task 2: {t2Words}w
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY(id, user.id))
              navigate('/mock-test')
            }}
            className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-gray-50"
          >
            버리고 나가기
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting || (!task1Essay.trim() && !task2Essay.trim())}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '지금 제출'}
          </button>
        </div>
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
            <h1 className="text-lg font-bold leading-tight">Writing Mock Test {id}회</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              총 {test.durationMin}분 · Task 1 + Task 2 자유 작성 · 붙여넣기 금지
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
        <p className="text-sm text-text whitespace-pre-line leading-relaxed mb-3">
          {currentTask.prompt}
        </p>
        {currentTask.chartIndex !== undefined && (
          <div className="mt-3">
            <Task1Chart questionIndex={currentTask.chartIndex} />
          </div>
        )}
      </div>

      {/* 에세이 입력 */}
      <textarea
        value={currentEssay}
        onChange={(e) => setCurrentEssay(e.target.value)}
        onPaste={(e) => {
          e.preventDefault()
          setError('모의고사에서는 붙여넣기가 허용되지 않아요. 직접 입력해 주세요.')
          setTimeout(() => setError(''), 3000)
        }}
        onDrop={(e) => e.preventDefault()}
        placeholder={`${currentTask.title} 에세이를 입력하세요... (붙여넣기 불가)`}
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
          크레딧 {profile?.credits ?? 0} · 제출 시 1 크레딧 차감
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
