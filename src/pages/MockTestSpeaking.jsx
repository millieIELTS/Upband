import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Volume2, ChevronRight, Clock, CheckCircle2, RotateCcw,
} from 'lucide-react'
import { speakQuestion, stopSpeaking, pickSessionVoice } from '../lib/tts'
import { part1Topics, part2Part3Topics } from '../data/speakingQuestions'
import { SPEAKING_MOCK_TESTS } from '../data/speakingMockTests'
import { useAuth } from '../hooks/useAuth'
import { saveSpeakingMockCompletion } from '../lib/submissions'

// Part 1: 각 토픽 6문제 중 앞 4문제씩 사용 → 총 8문제
const P1_QS_PER_TOPIC = 4
const PART2_PREP_SECONDS = 60
const PART2_SPEAK_SECONDS = 120
const P13_PREP_SECONDS = 3
const P13_ANSWER_SECONDS = 30

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MockTestSpeaking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const config = SPEAKING_MOCK_TESTS.find((t) => t.id === id)
  const savedRef = useRef(false)

  const { part1Questions, part2Card, part3Questions } = useMemo(() => {
    if (!config) return { part1Questions: [], part2Card: null, part3Questions: [] }
    const p1 = config.part1TopicIds.flatMap((tid) => {
      const topic = part1Topics.find((t) => t.id === tid)
      return topic ? topic.questions.slice(0, P1_QS_PER_TOPIC) : []
    })
    const t23 = part2Part3Topics.find((t) => t.id === config.part2Part3Id)
    return {
      part1Questions: p1,
      part2Card: t23?.part2 || null,
      part3Questions: t23?.part3 || [],
    }
  }, [config])

  // phase: 'intro' | 'part1' | 'part2-prep' | 'part2-speak' | 'part3' | 'done'
  const [phase, setPhase] = useState('intro')
  const [qIndex, setQIndex] = useState(0)

  // Part 1/3 하위 단계: 'playing' | 'prep' | 'answering'
  const [p13Sub, setP13Sub] = useState('playing')
  const [prepCountdown, setPrepCountdown] = useState(P13_PREP_SECONDS)
  const [answerCountdown, setAnswerCountdown] = useState(P13_ANSWER_SECONDS)

  // Part 2 타이머
  const [prepLeft, setPrepLeft] = useState(PART2_PREP_SECONDS)
  const [speakLeft, setSpeakLeft] = useState(PART2_SPEAK_SECONDS)

  // 세션 음성 고정 — 모의고사 중 같은 시험관 목소리 유지
  useEffect(() => {
    pickSessionVoice()
    return () => stopSpeaking()
  }, [])

  // 모의고사 완료 시 히스토리에 저장 (토큰 차감 없음)
  useEffect(() => {
    if (phase !== 'done') return
    if (!user || !config || savedRef.current) return
    savedRef.current = true
    saveSpeakingMockCompletion(user.id, id, config.summary).catch((err) => {
      // 저장 실패해도 UX 흐름은 유지 — 콘솔 경고만
      // eslint-disable-next-line no-console
      console.warn('Speaking mock completion 저장 실패:', err)
    })
  }, [phase, user, id, config])

  const currentQ = phase === 'part1'
    ? part1Questions[qIndex]
    : phase === 'part3'
      ? part3Questions[qIndex]
      : null

  // Part 1·3 진입 또는 문제 이동 시: 질문 자동 재생 → TTS 종료 시 'prep'로 전환
  useEffect(() => {
    if (phase !== 'part1' && phase !== 'part3') return
    setP13Sub('playing')
    setPrepCountdown(P13_PREP_SECONDS)
    setAnswerCountdown(P13_ANSWER_SECONDS)

    const t = setTimeout(() => {
      if (currentQ) {
        speakQuestion(currentQ, () => setP13Sub('prep'))
      }
    }, 300)

    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex])

  // Part 1·3: 'prep' — 3초 카운트다운 → 'answering'
  useEffect(() => {
    if (p13Sub !== 'prep') return
    setPrepCountdown(P13_PREP_SECONDS)
    const tick = setInterval(() => {
      setPrepCountdown((n) => {
        if (n <= 1) {
          clearInterval(tick)
          setP13Sub('answering')
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [p13Sub])

  // Part 1·3: 'answering' — 30초 카운트다운 → 자동으로 다음 질문
  useEffect(() => {
    if (p13Sub !== 'answering') return
    setAnswerCountdown(P13_ANSWER_SECONDS)
    const tick = setInterval(() => {
      setAnswerCountdown((n) => {
        if (n <= 1) {
          clearInterval(tick)
          handleNext()
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p13Sub])

  // Part 2 prep timer
  useEffect(() => {
    if (phase !== 'part2-prep') return
    setPrepLeft(PART2_PREP_SECONDS)
    if (part2Card) {
      speakQuestion(
        `Now, here is your topic card. ${part2Card.title}. You have one minute to prepare. You can make notes if you wish.`,
      )
    }
    const tick = setInterval(() => {
      setPrepLeft((n) => {
        if (n <= 1) {
          clearInterval(tick)
          setPhase('part2-speak')
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => {
      clearInterval(tick)
      stopSpeaking()
    }
  }, [phase, part2Card])

  // Part 2 speak timer
  useEffect(() => {
    if (phase !== 'part2-speak') return
    setSpeakLeft(PART2_SPEAK_SECONDS)
    speakQuestion('Please start speaking now.')

    const tick = setInterval(() => {
      setSpeakLeft((n) => {
        if (n <= 1) {
          clearInterval(tick)
          return 0
        }
        return n - 1
      })
    }, 1000)

    return () => {
      clearInterval(tick)
      stopSpeaking()
    }
  }, [phase])

  if (!config) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-text-secondary">모의고사를 찾을 수 없습니다.</p>
        <Link to="/mock-test/speaking" className="text-primary no-underline mt-3 inline-block">목록으로 돌아가기</Link>
      </div>
    )
  }

  const isPart1 = phase === 'part1'

  const goNextPart1 = () => {
    if (qIndex + 1 < part1Questions.length) {
      setQIndex(qIndex + 1)
    } else {
      setQIndex(0)
      setPhase('part2-prep')
    }
  }

  const goNextPart3 = () => {
    if (qIndex + 1 < part3Questions.length) {
      setQIndex(qIndex + 1)
    } else {
      setPhase('done')
    }
  }

  const handleNext = () => {
    stopSpeaking()
    if (isPart1) goNextPart1()
    else goNextPart3()
  }

  // ───────── Intro ─────────
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <Link to="/mock-test/speaking" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline">
          <ArrowLeft size={16} /> 목록으로
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Volume2 size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Speaking Mock Test {id}회</h1>
            <p className="text-sm text-text-secondary">시작하면 주제가 공개돼요</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 mb-4 space-y-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-semibold text-sm">Part 1 — 자기소개 및 일반 주제</p>
              <p className="text-xs text-text-secondary mt-0.5">
                두 주제에서 {P1_QS_PER_TOPIC}문제씩 총 {part1Questions.length}문제 · 준비 3초 + 답변 30초 자동 진행
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <p className="font-semibold text-sm">Part 2 — 토픽 카드 발표</p>
              <p className="text-xs text-text-secondary mt-0.5">준비 1분 → 발표 2분</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-semibold text-sm">Part 3 — 심화 토론</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {part3Questions.length}개 질문 · 준비 3초 + 답변 30초 자동 진행
              </p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-xs text-emerald-700 leading-relaxed">
          Part 1·3 질문은 음성으로만 제시되고 텍스트는 표시되지 않아요.
          답변 시간 동안 자유롭게 말해보세요. 먼저 끝났다면 <b>다음 질문</b> 버튼으로 바로 넘어갈 수 있어요.
          녹음·제출 없이 <b>토큰도 차감되지 않습니다</b>.
        </div>

        <button
          onClick={() => setPhase('part1')}
          className="w-full py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          <Play size={18} /> 모의고사 시작
        </button>
      </div>
    )
  }

  // ───────── Done ─────────
  if (phase === 'done') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <CheckCircle2 size={56} className="mx-auto text-emerald-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">수고하셨어요!</h1>
        <p className="text-text-secondary mb-8">Speaking Mock Test {id}회를 완료했어요.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => { savedRef.current = false; setQIndex(0); setPhase('intro') }}
            className="px-5 py-2.5 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 justify-center"
          >
            <RotateCcw size={14} /> 다시 풀기
          </button>
          <button
            onClick={() => navigate('/mock-test/speaking')}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            다른 회차 풀기
          </button>
        </div>
      </div>
    )
  }

  // ───────── Part 2 (cue card) ─────────
  if (phase === 'part2-prep' || phase === 'part2-speak') {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">Part 2</span>
          <div className="flex items-center gap-1.5 text-sm font-mono">
            <Clock size={14} className={phase === 'part2-prep' ? 'text-amber-500' : 'text-red-500'} />
            <span className={phase === 'part2-prep' ? 'text-amber-600' : 'text-red-500'}>
              {phase === 'part2-prep' ? `준비 ${formatTime(prepLeft)}` : `발표 ${formatTime(speakLeft)}`}
            </span>
          </div>
        </div>

        {/* 큐카드 */}
        <div className="bg-white border-2 border-black rounded-lg p-5 mb-5 shadow-md">
          <p className="text-sm font-bold mb-3">{part2Card?.title}</p>
          <p className="text-xs text-text-secondary mb-2">You should say:</p>
          <ul className="text-sm space-y-1.5 pl-4 list-disc">
            {part2Card?.points.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>

        {phase === 'part2-prep' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
            1분 동안 어떻게 이야기할지 구상해보세요. 메모해도 괜찮아요.
            <button
              onClick={() => setPhase('part2-speak')}
              className="mt-3 w-full py-2.5 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              준비 끝 · 바로 발표 시작
            </button>
          </div>
        ) : (
          <>
            <div className="bg-surface rounded-xl border border-border p-5 mb-4 text-center">
              <p className="text-xs text-text-secondary mb-2">발표 시간</p>
              <div className="relative mx-auto max-w-xs h-2 bg-red-100 rounded-full overflow-hidden mb-3">
                <div
                  className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(speakLeft / PART2_SPEAK_SECONDS) * 100}%` }}
                />
              </div>
              <p className="text-3xl font-bold text-red-500 font-mono">{formatTime(speakLeft)}</p>
            </div>

            <button
              onClick={() => { stopSpeaking(); setPhase('part3') }}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              Part 3로 이동 <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    )
  }

  // ───────── Part 1 & Part 3 ─────────
  const total = isPart1 ? part1Questions.length : part3Questions.length
  const partLabel = isPart1 ? 'Part 1' : 'Part 3'
  const partColor = isPart1 ? 'text-primary bg-primary/10' : 'text-purple-700 bg-purple-100'

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${partColor}`}>
          {partLabel} · {qIndex + 1} / {total}
        </span>
        <Link to="/mock-test/speaking" className="text-xs text-text-secondary hover:text-primary no-underline">
          나가기
        </Link>
      </div>

      {/* 진행 점 */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < qIndex ? 'bg-primary' : i === qIndex ? 'bg-primary/60' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 min-h-[260px] flex items-center justify-center">
        {p13Sub === 'playing' && (
          <div className="text-center">
            <Volume2 size={56} className="mx-auto text-primary mb-3 animate-pulse" />
            <p className="text-sm text-text-secondary">시험관의 질문을 듣고 있어요</p>
            <p className="text-xs text-text-secondary/70 mt-1">질문이 끝나면 준비 시간이 시작돼요</p>
          </div>
        )}

        {p13Sub === 'prep' && (
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-4">곧 답변 시간이 시작됩니다</p>
            <div className="text-7xl font-bold text-amber-500 font-mono leading-none">{prepCountdown}</div>
            <p className="text-xs text-text-secondary mt-4">답변을 준비하세요</p>
          </div>
        )}

        {p13Sub === 'answering' && (
          <div className="text-center w-full">
            <Clock size={40} className="mx-auto text-red-500 mb-3" />
            <p className="text-sm text-text-secondary mb-3">답변 시간</p>
            <div className="relative mx-auto max-w-xs h-2 bg-red-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(answerCountdown / P13_ANSWER_SECONDS) * 100}%` }}
              />
            </div>
            <p className="text-3xl font-bold text-red-500 mt-3 font-mono">{answerCountdown}s</p>
          </div>
        )}
      </div>

      {/* 다음 질문 버튼 — prep/answering 단계에서 언제든 스킵 가능 */}
      {(p13Sub === 'prep' || p13Sub === 'answering') && (
        <button
          onClick={handleNext}
          className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          {qIndex + 1 < total ? '다음 질문' : isPart1 ? 'Part 2로 이동' : '마치기'}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}
