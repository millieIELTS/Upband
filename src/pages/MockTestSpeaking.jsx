import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mic, MicOff, Volume2, Play, ChevronRight, CheckCircle2, Loader2, Clock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import useRecorder from '../hooks/useRecorder'
import { speakQuestion, stopSpeaking, pickSessionVoice } from '../lib/tts'
import { transcribeAudio } from '../lib/stt'
import { supabase } from '../lib/supabase'

const MOCK_TESTS = {
  '1': {
    title: 'Speaking 모의고사 1회',
    part1: {
      label: 'Part 1 — Personal Questions',
      maxSeconds: 30,
      questions: [
        'Do you work or are you a student?',
        'What do you enjoy doing in your free time?',
        'How often do you use public transport?',
        'What is your favourite type of weather, and why?',
      ],
    },
    part2: {
      label: 'Part 2 — Long Turn',
      prepSeconds: 60,
      speechSeconds: 120,
      topic: {
        title: 'Describe a place you have visited that you particularly liked.',
        points: [
          'Where it was',
          'When you went there',
          'What you did there',
          'And explain why you liked it',
        ],
      },
    },
    part3: {
      label: 'Part 3 — Discussion',
      maxSeconds: 60,
      questions: [
        'Why do people like to travel to different places?',
        'How has tourism changed in your country over the years?',
        'Do you think tourism has more positive or negative effects on local communities?',
        'Is travel important for personal growth? Why or why not?',
      ],
    },
  },
}

const COUNTDOWN_SECS = 3

export default function MockTestSpeaking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const test = MOCK_TESTS[id]

  // phase: intro | p1 | p2_intro | p2_prep | p2_countdown | p2_speak | p2_done | p3 | submitting | done
  const [phase, setPhase] = useState('intro')
  const [partKey, setPartKey] = useState(null) // 'part1' | 'part3'
  const [qIndex, setQIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [recordSecs, setRecordSecs] = useState(0)
  const [prepSecs, setPrepSecs] = useState(0)
  const [questionPlayed, setQuestionPlayed] = useState(false)
  const [recordings, setRecordings] = useState([]) // [{part, qIndex, question, blob}]
  const [submitProgress, setSubmitProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState('')

  const { recording, audioBlob, audioUrl, startRecording, stopRecording, clearRecording } = useRecorder()
  const recIntervalRef = useRef(null)
  const countdownIntervalRef = useRef(null)
  const prepIntervalRef = useRef(null)
  const submittedRef = useRef(false)

  useEffect(() => {
    pickSessionVoice()
    return () => {
      stopSpeaking()
      if (recIntervalRef.current) clearInterval(recIntervalRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
    }
  }, [])

  // ----- helpers -----
  const currentPart = partKey ? test[partKey] : null
  const currentQuestion = currentPart?.questions?.[qIndex]

  const playQuestion = (text) => {
    setQuestionPlayed(false)
    speakQuestion(text, () => setQuestionPlayed(true))
  }

  const startCountdown = useCallback((onDone) => {
    setCountdown(COUNTDOWN_SECS)
    let n = COUNTDOWN_SECS
    countdownIntervalRef.current = setInterval(() => {
      n -= 1
      setCountdown(n)
      if (n <= 0) {
        clearInterval(countdownIntervalRef.current)
        onDone()
      }
    }, 1000)
  }, [])

  const beginRecording = useCallback(async (maxSeconds) => {
    setRecordSecs(0)
    await startRecording()
    let elapsed = 0
    recIntervalRef.current = setInterval(() => {
      elapsed += 1
      setRecordSecs(elapsed)
      if (elapsed >= maxSeconds) {
        clearInterval(recIntervalRef.current)
        stopRecording()
      }
    }, 1000)
  }, [startRecording, stopRecording])

  const stopRecordingNow = () => {
    if (recIntervalRef.current) clearInterval(recIntervalRef.current)
    stopRecording()
  }

  // ----- Part 1 / Part 3 (질문 단발 녹음 패턴) -----
  const startPartQ = (key, idx) => {
    setPartKey(key)
    setQIndex(idx)
    setPhase(key === 'part1' ? 'p1' : 'p3')
    clearRecording()
    setRecordSecs(0)
    setQuestionPlayed(false)
    setTimeout(() => playQuestion(test[key].questions[idx]), 300)
  }

  const onRecordReadyClick = () => {
    startCountdown(() => {
      beginRecording(currentPart.maxSeconds)
    })
  }

  // 녹음 끝났을 때 (audioBlob 도착)
  useEffect(() => {
    if (!audioBlob || phase === 'submitting' || phase === 'done') return
    // p1 / p3에서 녹음 자동완료 시
    if ((phase === 'p1' || phase === 'p3') && partKey) {
      // already added prevention
      const exists = recordings.some(r => r.part === partKey && r.qIndex === qIndex)
      if (!exists) {
        setRecordings(prev => [...prev, {
          part: partKey,
          qIndex,
          question: currentPart.questions[qIndex],
          blob: audioBlob,
        }])
      }
    }
    // p2_speak 종료 시
    if (phase === 'p2_speak') {
      const exists = recordings.some(r => r.part === 'part2')
      if (!exists) {
        setRecordings(prev => [...prev, {
          part: 'part2',
          qIndex: 0,
          question: test.part2.topic.title,
          blob: audioBlob,
        }])
      }
      setPhase('p2_done')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob])

  const goNextQ = () => {
    const nextIdx = qIndex + 1
    if (nextIdx < currentPart.questions.length) {
      clearRecording()
      startPartQ(partKey, nextIdx)
    } else {
      // part 종료
      if (partKey === 'part1') {
        setPhase('p2_intro')
        clearRecording()
      } else if (partKey === 'part3') {
        finalSubmit()
      }
    }
  }

  // ----- Part 2 (cue card) -----
  const startPart2 = () => {
    setPartKey('part2')
    setPhase('p2_prep')
    setPrepSecs(test.part2.prepSeconds)
    let n = test.part2.prepSeconds
    prepIntervalRef.current = setInterval(() => {
      n -= 1
      setPrepSecs(n)
      if (n <= 0) {
        clearInterval(prepIntervalRef.current)
        setPhase('p2_countdown')
        startCountdown(() => {
          setPhase('p2_speak')
          beginRecording(test.part2.speechSeconds)
        })
      }
    }, 1000)
  }

  const skipPrep = () => {
    if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
    setPhase('p2_countdown')
    startCountdown(() => {
      setPhase('p2_speak')
      beginRecording(test.part2.speechSeconds)
    })
  }

  const startPart3 = () => {
    clearRecording()
    startPartQ('part3', 0)
  }

  // ----- 최종 제출 -----
  const finalSubmit = async () => {
    if (submittedRef.current) return
    if (!user) { navigate('/login'); return }
    submittedRef.current = true
    setPhase('submitting')
    setError('')
    setSubmitProgress({ done: 0, total: recordings.length })

    try {
      let count = 0
      for (const rec of recordings) {
        let transcript = ''
        try {
          transcript = await transcribeAudio(rec.blob)
        } catch (err) {
          transcript = '[음성 변환 실패]'
        }

        const partLabel = rec.part === 'part1' ? 'part1' : rec.part === 'part2' ? 'part2' : 'part3'

        await supabase.from('speaking_submissions').insert({
          user_id: user.id,
          part: partLabel,
          question: rec.question,
          transcript,
          audio_url: null,
          overall_band: null,
          score_fluency: null,
          score_lexical: null,
          score_grammar: null,
          feedback_json: { mock_test_id: id, q_index: rec.qIndex },
          model_answer: null,
        })

        count += 1
        setSubmitProgress({ done: count, total: recordings.length })
      }

      // 크레딧 차감 (3 파트 = 3 크레딧)
      try {
        await supabase.rpc('deduct_credit')
        await supabase.rpc('deduct_credit')
        await supabase.rpc('deduct_credit')
      } catch (err) {
        // 크레딧 부족 등 — 제출은 이미 됐음
      }
      refreshProfile()

      setPhase('done')
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(err.message || '제출 중 오류가 발생했습니다.')
      submittedRef.current = false
      setPhase(partKey === 'part3' ? 'p3' : 'p2_done')
    }
  }

  // ----- 화면 -----
  if (!test) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary mb-4">존재하지 않는 모의고사입니다.</p>
        <Link to="/mock-test" className="text-primary no-underline">모의고사 목록으로</Link>
      </div>
    )
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <Link
        to="/mock-test"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> 모의고사 목록
      </Link>

      <h1 className="text-xl font-bold mb-1">Mock Test {id}회 — Speaking</h1>
      <p className="text-text-secondary text-sm mb-6">Part 1 → Part 2 → Part 3 순서로 진행됩니다.</p>

      {/* 진행 표시 */}
      <div className="flex items-center gap-2 mb-6 text-xs">
        <Step label="Part 1" active={['p1'].includes(phase)} done={recordings.some(r => r.part === 'part1' && r.qIndex === test.part1.questions.length - 1)} />
        <ChevronRight size={12} className="text-text-secondary" />
        <Step label="Part 2" active={['p2_intro', 'p2_prep', 'p2_countdown', 'p2_speak', 'p2_done'].includes(phase)} done={recordings.some(r => r.part === 'part2')} />
        <ChevronRight size={12} className="text-text-secondary" />
        <Step label="Part 3" active={['p3'].includes(phase)} done={recordings.some(r => r.part === 'part3' && r.qIndex === test.part3.questions.length - 1)} />
      </div>

      {/* INTRO */}
      {phase === 'intro' && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold mb-1">시험 안내</p>
            <ul className="text-sm text-text-secondary space-y-1.5 list-disc pl-5">
              <li>Part 1: 4개 질문 (각 최대 30초 답변)</li>
              <li>Part 2: 1분 준비 후 2분 스피치</li>
              <li>Part 3: 4개 질문 (각 최대 60초 답변)</li>
              <li>각 질문은 음성으로 들려드려요. 다 듣고 녹음 시작 버튼을 누르세요.</li>
              <li>녹음 종료 후 다음 질문으로 넘어가요.</li>
              <li>모든 답변은 텍스트로 변환되어 선생님께 전달됩니다.</li>
              <li>총 3 크레딧이 차감됩니다.</li>
            </ul>
          </div>
          <button
            onClick={() => startPartQ('part1', 0)}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            시작하기
          </button>
        </div>
      )}

      {/* PART 1 / PART 3 화면 */}
      {(phase === 'p1' || phase === 'p3') && currentPart && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-xs text-primary font-semibold mb-2">
            {currentPart.label} · 질문 {qIndex + 1} / {currentPart.questions.length}
          </p>

          {/* 질문은 녹음 완료 후에만 노출 — 실제 시험처럼 음성으로만 들음 */}
          {!audioUrl && (
            <div className="bg-bg border border-border rounded-lg p-4 mb-4 flex items-center gap-3">
              <Volume2 size={18} className="text-primary shrink-0" />
              <p className="text-sm text-text-secondary">
                질문은 음성으로만 들려드려요. 다 듣고 녹음 시작 버튼을 눌러주세요.
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => playQuestion(currentQuestion)}
              disabled={recording || countdown > 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Volume2 size={14} /> 다시 듣기
            </button>
          </div>

          {!recording && recordSecs === 0 && !audioUrl && countdown === 0 && (
            <button
              onClick={onRecordReadyClick}
              disabled={!questionPlayed}
              className="w-full flex items-center justify-center gap-2 py-3 bg-error text-white rounded-xl font-medium hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Mic size={16} /> {questionPlayed ? '녹음 시작' : '질문 듣는 중...'}
            </button>
          )}

          {countdown > 0 && !recording && recordSecs === 0 && !audioUrl && (
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-primary">{countdown}</div>
              <p className="text-xs text-text-secondary mt-2">곧 녹음이 시작됩니다</p>
            </div>
          )}

          {recording && (
            <div className="bg-error/5 border-2 border-error/30 rounded-xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mic size={16} className="text-error animate-pulse" />
                <span className="text-sm font-medium text-error">녹음 중</span>
              </div>
              <p className="text-3xl font-bold text-error mb-1">
                {formatTime(currentPart.maxSeconds - recordSecs)}
              </p>
              <p className="text-xs text-text-secondary mb-3">최대 {currentPart.maxSeconds}초</p>
              <button
                onClick={stopRecordingNow}
                className="px-4 py-2 rounded-lg border border-error/30 text-error text-sm hover:bg-error/10"
              >
                <MicOff size={12} className="inline mr-1" /> 답변 종료
              </button>
            </div>
          )}

          {!recording && audioUrl && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-sm text-emerald-700">녹음 완료</span>
              </div>
              <div className="bg-bg border border-border rounded-lg p-4">
                <p className="text-[11px] text-text-secondary mb-1">방금 들으신 질문은:</p>
                <p className="text-sm font-medium">{currentQuestion}</p>
              </div>
              <audio src={audioUrl} controls className="w-full" />
              <button
                onClick={goNextQ}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
              >
                {qIndex + 1 < currentPart.questions.length
                  ? '다음 질문 →'
                  : partKey === 'part1' ? 'Part 2로 이동 →' : '제출하기'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PART 2 INTRO */}
      {phase === 'p2_intro' && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-xs text-primary font-semibold mb-3">{test.part2.label}</p>
          <p className="text-sm text-text-secondary mb-4">
            준비 시간 1분 동안 토픽 카드를 읽고 메모를 정리하세요. 1분이 지나면 자동으로 녹음이 시작됩니다.
          </p>
          <div className="bg-bg border border-border rounded-lg p-4 mb-4">
            <p className="font-medium mb-2">{test.part2.topic.title}</p>
            <p className="text-xs text-text-secondary mb-1">You should say:</p>
            <ul className="space-y-1 text-sm">
              {test.part2.topic.points.map((p, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{p}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={startPart2}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            <Clock size={16} /> 준비 시작 (1분)
          </button>
        </div>
      )}

      {/* PART 2 PREP */}
      {phase === 'p2_prep' && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-xs text-primary font-semibold mb-3">{test.part2.label} — 준비 시간</p>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center mb-4">
            <p className="text-sm text-amber-700 mb-2">준비 시간</p>
            <div className="text-5xl font-bold text-amber-600">{formatTime(prepSecs)}</div>
          </div>
          <div className="bg-bg border border-border rounded-lg p-4 mb-4">
            <p className="font-medium mb-2">{test.part2.topic.title}</p>
            <ul className="space-y-1 text-sm">
              {test.part2.topic.points.map((p, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{p}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={skipPrep}
            className="w-full py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-gray-50"
          >
            준비 끝 — 바로 시작
          </button>
        </div>
      )}

      {/* PART 2 COUNTDOWN */}
      {phase === 'p2_countdown' && (
        <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-primary mb-3">곧 스피킹을 시작해주세요</p>
          <div className="text-7xl font-bold text-primary">{countdown}</div>
        </div>
      )}

      {/* PART 2 SPEAK */}
      {phase === 'p2_speak' && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-xs text-primary font-semibold mb-3">{test.part2.label} — 스피치 (최대 2분)</p>
          <div className="bg-bg border border-border rounded-lg p-4 mb-4">
            <p className="font-medium text-sm mb-2">{test.part2.topic.title}</p>
            <ul className="space-y-1 text-xs text-text-secondary">
              {test.part2.topic.points.map((p, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{p}</li>
              ))}
            </ul>
          </div>
          <div className="bg-error/5 border-2 border-error/30 rounded-xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mic size={18} className="text-error animate-pulse" />
              <span className="text-sm font-medium text-error">녹음 중</span>
            </div>
            <p className="text-4xl font-bold text-error mb-3">
              {formatTime(test.part2.speechSeconds - recordSecs)}
            </p>
            <button
              onClick={stopRecordingNow}
              className="px-5 py-2 rounded-lg border border-error/30 text-error text-sm hover:bg-error/10"
            >
              <MicOff size={12} className="inline mr-1" /> 스피치 종료
            </button>
          </div>
        </div>
      )}

      {/* PART 2 DONE */}
      {phase === 'p2_done' && audioUrl && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-sm text-emerald-700">Part 2 녹음 완료</span>
          </div>
          <audio src={audioUrl} controls className="w-full mb-4" />
          <button
            onClick={startPart3}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            Part 3로 이동 →
          </button>
        </div>
      )}

      {/* SUBMITTING */}
      {phase === 'submitting' && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <Loader2 size={32} className="text-primary mx-auto mb-3 animate-spin" />
          <p className="text-sm font-medium mb-1">제출 중입니다…</p>
          <p className="text-xs text-text-secondary">
            음성을 텍스트로 변환하는 중 ({submitProgress.done} / {submitProgress.total})
          </p>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <CheckCircle2 size={48} className="text-success mx-auto mb-3" />
          <p className="text-base font-bold mb-1">제출 완료!</p>
          <p className="text-sm text-text-secondary">선생님이 곧 채점해 드릴게요.</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      <p className="text-[11px] text-text-secondary text-center mt-6">
        보유 크레딧: {profile?.credits ?? 0} · 제출 시 3 크레딧 차감
      </p>
    </div>
  )
}

function Step({ label, active, done }) {
  return (
    <div className={`px-2 py-1 rounded font-medium ${
      done ? 'bg-emerald-100 text-emerald-700' :
      active ? 'bg-primary text-white' :
      'bg-gray-100 text-text-secondary'
    }`}>
      {done && <CheckCircle2 size={10} className="inline mr-1" />}
      {label}
    </div>
  )
}
