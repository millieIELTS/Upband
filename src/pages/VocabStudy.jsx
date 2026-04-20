import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Check, X, Trophy } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { bandLevels, topics, synonymData } from '../data/synonyms'
import { useVocabProgress } from '../hooks/useVocabProgress'
import { useStreak } from '../hooks/useStreak'

export default function VocabStudy() {
  const { bandId, topicId } = useParams()
  const band = bandLevels.find(b => b.id === bandId)
  const topic = topics.find(t => t.id === topicId)
  const words = synonymData[bandId]?.[topicId] || []
  const { getProgress, saveProgress, loaded } = useVocabProgress()
  const { recordActivity } = useStreak()

  const [mode, setMode] = useState('cards') // cards | quiz | results
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Supabase에서 진행도 로드 후 카드 위치 복원
  useEffect(() => {
    if (loaded) {
      const saved = getProgress(bandId, topicId)
      if (saved > 0 && saved < words.length) setCardIndex(saved)
    }
  }, [loaded, bandId, topicId])

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState([])

  // 진행도 저장
  useEffect(() => {
    if (mode === 'cards' && words.length > 0) {
      saveProgress(bandId, topicId, cardIndex)
    }
  }, [cardIndex, mode, bandId, topicId, words.length])

  const quizQuestions = useMemo(() => {
    // 랜덤 10개 출제
    const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, 10)
    return shuffledWords.map(item => {
      const correct = item.synonyms[0]
      const others = words
        .filter(w => w.word !== item.word)
        .flatMap(w => w.synonyms)
      const shuffled = others.sort(() => Math.random() - 0.5)
      const wrongs = shuffled.slice(0, 3)
      const options = [correct, ...wrongs].sort(() => Math.random() - 0.5)
      return { word: item.word, meaning: item.meaning, correct, options }
    })
  }, [words, mode])

  if (!band || !topic || words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <p className="text-text-secondary">데이터를 찾을 수 없습니다.</p>
        <Link to="/vocab" className="text-primary text-sm mt-4 inline-block no-underline">돌아가기</Link>
      </div>
    )
  }

  const backUrl = `/vocab/${bandId}`

  // ─── Card Mode ───
  if (mode === 'cards') {
    const item = words[cardIndex]
    return (
      <div className="max-w-lg mx-auto py-10 px-4">
        <Link to={backUrl} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline">
          <ArrowLeft size={16} /> {topic.name} 목록으로
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-0.5 rounded-md ${band.bg} text-xs font-bold ${band.color}`}>{band.label}</span>
          <span className="text-lg">{topic.emoji}</span>
          <span className="text-sm font-medium">{topic.name}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6">
          <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${((cardIndex + 1) / words.length) * 100}%` }} />
        </div>

        {/* Card with side arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setCardIndex(Math.max(0, cardIndex - 1)); setFlipped(false) }}
            disabled={cardIndex === 0}
            className="shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center disabled:opacity-20 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            onClick={() => setFlipped(!flipped)}
            className="relative flex-1 min-h-[280px] bg-surface rounded-2xl border border-border p-8 cursor-pointer hover:shadow-lg transition-all select-none"
          >
            {!flipped ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[220px]">
                <p className="text-3xl font-bold text-text mb-2">{item.word}</p>
                {item.meaning && <p className="text-sm text-text-secondary mb-3">{item.meaning}</p>}
                <p className="text-xs text-text-secondary/60">탭하여 동의어 보기</p>
              </div>
            ) : (
              <div className="flex flex-col justify-center h-full min-h-[220px]">
                <p className="text-sm text-text-secondary mb-1">동의어</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {item.synonyms.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">{s}</span>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-text-secondary mb-1">Example</p>
                  <p className="text-sm text-text italic leading-relaxed">{item.example}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => { setCardIndex(Math.min(words.length - 1, cardIndex + 1)); setFlipped(false) }}
            disabled={cardIndex === words.length - 1}
            className="shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center disabled:opacity-20 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 카드 카운팅 (카드 아래) */}
        <p className="text-center text-sm text-text-secondary mt-3 tabular-nums">
          {cardIndex + 1} / {words.length}
        </p>

        {/* 하단: 퀴즈 시작 버튼 */}
        <div className="flex items-center justify-center mt-4">
          {cardIndex === words.length - 1 ? (
            <button
              onClick={() => setMode('quiz')}
              className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              랜덤 10문제 퀴즈 시작
            </button>
          ) : (
            <button
              onClick={() => setMode('quiz')}
              className="text-xs text-text-secondary hover:text-primary transition-colors underline"
            >
              바로 퀴즈 시작 (랜덤 10문제)
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── Quiz Mode ───
  if (mode === 'quiz') {
    const q = quizQuestions[quizIndex]
    return (
      <div className="max-w-lg mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md ${band.bg} text-xs font-bold ${band.color}`}>{band.label}</span>
            <span className="text-sm font-medium">Quiz</span>
          </div>
          <span className="text-sm text-text-secondary">{quizIndex + 1} / {quizQuestions.length}</span>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8">
          <div className="h-1.5 bg-violet-500 rounded-full transition-all" style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} />
        </div>

        <p className="text-center text-text-secondary text-sm mb-2">다음 단어의 동의어를 고르세요</p>
        <p className="text-center text-2xl font-bold mb-8">{q.word}</p>

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let style = 'bg-surface border-border hover:border-primary'
            if (showAnswer) {
              if (opt === q.correct) style = 'bg-green-50 border-green-400 text-green-800'
              else if (opt === selected && opt !== q.correct) style = 'bg-red-50 border-red-400 text-red-800'
              else style = 'bg-surface border-border opacity-50'
            }

            return (
              <button
                key={i}
                onClick={() => {
                  if (showAnswer) return
                  setSelected(opt)
                  setShowAnswer(true)
                  if (opt === q.correct) {
                    setScore(s => s + 1)
                  } else {
                    setWrongAnswers(prev => [...prev, { word: q.word, meaning: q.meaning, correct: q.correct }])
                  }
                  // 0.8초 후 자동으로 다음 문제
                  setTimeout(() => {
                    if (quizIndex === quizQuestions.length - 1) {
                      saveProgress(bandId, topicId, words.length)
                      recordActivity('vocab') // 🔥 스트릭 + 활동 로그
                      setMode('results')
                    } else {
                      setQuizIndex(qi => qi + 1)
                      setSelected(null)
                      setShowAnswer(false)
                    }
                  }, 800)
                }}
                className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all ${style}`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {showAnswer && opt === q.correct && <Check size={18} className="text-green-600" />}
                  {showAnswer && opt === selected && opt !== q.correct && <X size={18} className="text-red-500" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Results ───
  const pct = Math.round((score / quizQuestions.length) * 100)
  return (
    <div className="max-w-lg mx-auto py-10 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <Trophy size={32} className="text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">퀴즈 완료!</h2>
      <p className="text-text-secondary mb-6">{topic.emoji} {topic.name} · {band.label}</p>

      <div className="bg-surface rounded-2xl border border-border p-8 mb-6">
        <p className="text-5xl font-bold text-primary mb-1">{score}<span className="text-lg text-text-secondary">/{quizQuestions.length}</span></p>
        <p className="text-sm text-text-secondary">{pct}% 정답</p>
        <div className="w-full h-2 bg-gray-100 rounded-full mt-4">
          <div
            className={`h-2 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm mt-3 font-medium">
          {pct >= 80 ? '훌륭해요! 이 단어들을 잘 알고 있네요 🎉' : pct >= 50 ? '좋아요! 조금 더 연습하면 완벽해질 거예요' : '다시 카드를 복습해보세요!'}
        </p>
      </div>

      {/* 틀린 문제 리스트 */}
      {wrongAnswers.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-6 mb-6 text-left">
          <p className="text-sm font-bold text-red-500 mb-3">틀린 단어 ({wrongAnswers.length}개)</p>
          <div className="space-y-2">
            {wrongAnswers.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="font-medium text-text">{item.word}</span>
                  {item.meaning && <span className="text-text-secondary text-sm ml-2">{item.meaning}</span>}
                </div>
                <span className="text-xs text-green-600 font-medium">→ {item.correct}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => {
            setMode('cards')
            setCardIndex(0)
            setFlipped(false)
            setQuizIndex(0)
            setScore(0)
            setSelected(null)
            setShowAnswer(false)
            setWrongAnswers([])
          }}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={16} /> 다시 학습
        </button>
        <Link
          to={backUrl}
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium no-underline hover:bg-primary-dark transition-colors"
        >
          다른 주제 선택
        </Link>
      </div>
    </div>
  )
}
