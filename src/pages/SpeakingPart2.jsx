import { useState, useCallback, useRef, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Mic, MicOff, Send, Loader2 } from 'lucide-react'
import useTimer from '../hooks/useTimer'
import useRecorder from '../hooks/useRecorder'
import { useAuth } from '../hooks/useAuth'
import { getSpeakingFeedback } from '../lib/claude'
import { transcribeAudio } from '../lib/stt'
import FeedbackResult from '../components/speaking/FeedbackResult'
import { part2Part3Topics } from '../data/speakingQuestions'

const PREP_SECONDS = 60
const COUNTDOWN_SECONDS = 5
const SPEECH_SECONDS = 120

export default function SpeakingPart2() {
  const { topicId } = useParams()
  const topicData = part2Part3Topics.find(t => t.id === Number(topicId)) || part2Part3Topics[0]
  const topic = topicData.part2

  const [phase, setPhase] = useState('ready')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [loading, setLoading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const { recording, audioUrl, audioBlob, startRecording, stopRecording, clearRecording } = useRecorder()
  const { user } = useAuth()
  const navigate = useNavigate()
  const speechTimerRef = useRef(null)
  const countdownRef = useRef(null)

  const onSpeechComplete = useCallback(() => {
    stopRecording()
    setPhase('done')
  }, [stopRecording])

  const startSpeechAfterCountdown = useCallback(() => {
    setPhase('countdown')
    setCountdown(COUNTDOWN_SECONDS)
    let remaining = COUNTDOWN_SECONDS
    countdownRef.current = setInterval(() => {
      remaining -= 1
      setCountdown(remaining)
      if (remaining <= 0) {
        clearInterval(countdownRef.current)
        setPhase('speaking')
        startRecording()
        speechTimerRef.current?.()
      }
    }, 1000)
  }, [startRecording])

  const onPrepComplete = useCallback(() => {
    startSpeechAfterCountdown()
  }, [startSpeechAfterCountdown])

  const prepTimer = useTimer(PREP_SECONDS, onPrepComplete)
  const speechTimer = useTimer(SPEECH_SECONDS, onSpeechComplete)
  speechTimerRef.current = speechTimer.start

  // 페이지 이탈 시 카운트다운 정리
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const startPrep = () => {
    setPhase('prep')
    prepTimer.start()
  }

  const endSpeechEarly = () => {
    speechTimer.stop()
    stopRecording()
    setPhase('done')
  }

  const handleSubmit = async () => {
    if (!audioBlob) return
    if (!user) { navigate('/login'); return }

    setError('')
    setTranscribing(true)

    try {
      let text = transcript
      if (!text) {
        text = await transcribeAudio(audioBlob)
        setTranscript(text)
      }
      setTranscribing(false)

      setLoading(true)
      const feedback = await getSpeakingFeedback({
        text,
        part: 'part2',
        question: topic.title,
      })
      setResult(feedback)

      const key = `speaking_done_part2`
      const done = JSON.parse(localStorage.getItem(key) || '[]')
      if (!done.includes(topicData.id)) {
        done.push(topicData.id)
        localStorage.setItem(key, JSON.stringify(done))
      }
    } catch (err) {
      setError(err.message)
      setTranscribing(false)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setPhase('ready')
    setCountdown(COUNTDOWN_SECONDS)
    setResult(null)
    setTranscript('')
    setError('')
    clearRecording()
    prepTimer.reset(PREP_SECONDS)
    speechTimer.reset(SPEECH_SECONDS)
  }

  return (
    <div>
      <Link
        to="/speaking/part2"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> 주제 선택으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-1">Speaking Part 2 — {topicData.name}</h1>
      <p className="text-text-secondary text-sm mb-8">주제 카드를 보고 1분 준비 → 2분 스피치</p>

      <div className="bg-surface rounded-xl border border-border p-6 mb-4">
        <h3 className="font-semibold text-sm mb-4">Topic Card</h3>
        <p className="font-medium text-text mb-3">{topic.title}</p>
        <p className="text-xs text-text-secondary mb-2">You should say:</p>
        <ul className="space-y-1">
          {topic.points.map((point, i) => (
            <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span> {point}
            </li>
          ))}
        </ul>
      </div>

      {phase === 'ready' && (
        <button
          onClick={startPrep}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white font-medium text-lg hover:bg-primary-dark transition-colors"
        >
          <Clock size={20} /> 준비 시작 (1분)
        </button>
      )}

      {phase === 'prep' && (
        <div className="bg-accent/10 rounded-xl border-2 border-accent/30 p-6 text-center">
          <p className="text-sm text-text-secondary mb-2">준비 시간</p>
          <div className="text-5xl font-bold text-accent mb-3">{prepTimer.formatted}</div>
          <p className="text-xs text-text-secondary">시간이 끝나면 자동으로 녹음이 시작됩니다</p>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="bg-primary/5 rounded-xl border-2 border-primary/30 p-8 text-center">
          <p className="text-lg font-semibold text-primary mb-3">🎙 스피킹을 시작해주세요</p>
          <div className="text-6xl font-bold text-primary mb-3">{countdown}</div>
          <p className="text-sm text-text-secondary">곧 녹음이 시작됩니다</p>
        </div>
      )}

      {phase === 'speaking' && (
        <div className="bg-error/5 rounded-xl border-2 border-error/30 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mic size={18} className="text-error animate-pulse" />
            <p className="text-sm font-medium text-error">녹음 중</p>
          </div>
          <div className="text-5xl font-bold text-error mb-3">{speechTimer.formatted}</div>
          <button
            onClick={endSpeechEarly}
            className="px-6 py-2 rounded-lg border border-error/30 text-error text-sm hover:bg-error/10 transition-colors"
          >
            <MicOff size={14} className="inline mr-1" /> 스피치 종료
          </button>
        </div>
      )}

      {phase === 'done' && audioUrl && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold text-sm mb-3">녹음 완료</h3>
          <audio src={audioUrl} controls className="w-full mb-3" />
          {transcript && (
            <p className="text-xs text-text-secondary bg-bg p-2 rounded-lg mb-3">{transcript}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex-1 py-2 rounded-lg border border-border text-sm text-text-secondary hover:border-error hover:text-error transition-colors"
            >
              다시 시작
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || transcribing}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {(loading || transcribing) ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {transcribing ? '음성 변환 중...' : loading ? '분석 중...' : '피드백 받기'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      <FeedbackResult result={result} />
    </div>
  )
}
