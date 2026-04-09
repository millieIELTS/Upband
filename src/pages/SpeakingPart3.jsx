import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play, Mic, MicOff, Send, Loader2, Volume2, List } from 'lucide-react'
import useRecorder from '../hooks/useRecorder'
import { useAuth } from '../hooks/useAuth'
import { getSpeakingFeedback } from '../lib/claude'
import { transcribeAudio } from '../lib/stt'
import { speakQuestion, stopSpeaking, stopPlaying, pickSessionVoice } from '../lib/tts'
import FeedbackResult from '../components/speaking/FeedbackResult'
import QuestionProgress from '../components/speaking/QuestionProgress'
import { part3Topics } from '../data/speakingQuestions'

export default function SpeakingPart3() {
  const { topicId } = useParams()
  const topic = part3Topics.find(t => t.id === Number(topicId)) || part3Topics[0]
  const questions = topic.questions

  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionPlayed, setQuestionPlayed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showAllQuestions, setShowAllQuestions] = useState(false)
  const { recording, audioUrl, audioBlob, startRecording, stopRecording, clearRecording } = useRecorder()
  const { user } = useAuth()
  const navigate = useNavigate()

  const currentQuestion = questions[questionIndex]

  // 토픽 진입 시 음성 배정, 이탈 시 정지
  useEffect(() => {
    pickSessionVoice()
    return () => stopSpeaking()
  }, [])

  const playQuestion = () => {
    setPlaying(true)
    speakQuestion(currentQuestion, () => {
      setPlaying(false)
      setQuestionPlayed(true)
    })
  }

  const replayQuestion = () => {
    setPlaying(true)
    speakQuestion(currentQuestion, () => setPlaying(false))
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
        part: 'part3',
        question: currentQuestion,
      })
      setResult(feedback)

      const key = `speaking_done_part3`
      const done = JSON.parse(localStorage.getItem(key) || '[]')
      if (!done.includes(topic.id)) {
        done.push(topic.id)
        localStorage.setItem(key, JSON.stringify(done))
      }
    } catch (err) {
      setError(err.message)
      setTranscribing(false)
    } finally {
      setLoading(false)
    }
  }

  const goToQuestion = (index) => {
    stopPlaying()
    setQuestionIndex(index)
    setQuestionPlayed(false)
    setPlaying(false)
    setResult(null)
    setTranscript('')
    setError('')
    clearRecording()
  }

  return (
    <div>
      <Link
        to="/speaking/part3"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> 주제 선택으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-1">Speaking Part 3 — {topic.name}</h1>
      <p className="text-text-secondary text-sm mb-4">Part 2-{topic.id} 연계 심화 질문을 듣고 답변을 녹음하세요.</p>

      <QuestionProgress
        current={questionIndex}
        total={questions.length}
        onSelect={goToQuestion}
      />

      {/* Question audio */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-4">
        <h3 className="font-semibold text-sm mb-3">Discussion Question {questionIndex + 1}</h3>

        {!questionPlayed ? (
          <button
            onClick={playQuestion}
            disabled={playing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-primary/5 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            {playing ? <Volume2 size={20} className="animate-pulse" /> : <Play size={20} />}
            <span className="font-medium">{playing ? '재생 중...' : '질문 듣기'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 py-3 text-text-secondary">
            <button
              onClick={replayQuestion}
              disabled={playing}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark disabled:opacity-50"
            >
              {playing ? <Volume2 size={16} className="animate-pulse" /> : <Play size={16} />}
              다시 듣기
            </button>
            <span className="text-xs">질문이 재생되었습니다. 답변을 녹음하세요.</span>
          </div>
        )}
      </div>

      {/* Record answer */}
      {questionPlayed && (
        <div className="bg-surface rounded-xl border border-border p-6 mb-4">
          <h3 className="font-semibold text-sm mb-3">Your Answer</h3>

          {!audioUrl ? (
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg font-medium transition-colors ${
                recording
                  ? 'bg-error text-white animate-pulse'
                  : 'bg-primary/5 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/10'
              }`}
            >
              {recording ? <MicOff size={20} /> : <Mic size={20} />}
              {recording ? '녹음 중지' : '답변 녹음 시작'}
            </button>
          ) : (
            <div className="space-y-3">
              <audio src={audioUrl} controls className="w-full" />
              {transcript && (
                <p className="text-xs text-text-secondary bg-bg p-2 rounded-lg">{transcript}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { clearRecording(); setTranscript(''); setResult(null); setError('') }}
                  className="flex-1 py-2 rounded-lg border border-border text-sm text-text-secondary hover:border-error hover:text-error transition-colors"
                >
                  다시 녹음
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
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      {audioUrl && (
        <div className="mb-4 p-4 rounded-lg bg-bg border border-border">
          <p className="text-xs text-text-secondary mb-1">질문</p>
          <p className="text-sm text-text font-medium">"{currentQuestion}"</p>
        </div>
      )}

      <FeedbackResult result={result} />

      {/* 전체 질문 보기 */}
      <div className="mt-6">
        <button
          onClick={() => setShowAllQuestions(!showAllQuestions)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <List size={16} />
          {showAllQuestions ? '질문 목록 숨기기' : '전체 질문 텍스트 보기'}
        </button>
        {showAllQuestions && (
          <div className="mt-3 bg-surface rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold mb-2">Part 3 — {topic.name} 전체 질문</h3>
            {questions.map((q, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xs text-text-secondary font-mono shrink-0 mt-0.5">Q{i + 1}</span>
                <p className="text-sm text-text">{q}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
