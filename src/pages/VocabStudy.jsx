import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Check, X, Trophy } from 'lucide-react'
import { useState, useMemo } from 'react'
import { bandLevels, topics, synonymData } from '../data/synonyms'

export default function VocabStudy() {
  const { bandId, topicId } = useParams()
  const band = bandLevels.find(b => b.id === bandId)
  const topic = topics.find(t => t.id === topicId)
  const words = synonymData[bandId]?.[topicId] || []

  const [mode, setMode] = useState('cards') // cards | quiz | results
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const quizQuestions = useMemo(() => {
    return words.map(item => {
      const correct = item.synonyms[0]
      // Pick 3 wrong answers from other words' synonyms
      const others = words
        .filter(w => w.word !== item.word)
        .flatMap(w => w.synonyms)
      const shuffled = others.sort(() => Math.random() - 0.5)
      const wrongs = shuffled.slice(0, 3)
      const options = [correct, ...wrongs].sort(() => Math.random() - 0.5)
      return { word: item.word, correct, options }
    })
  }, [words])

  if (!band || !topic || words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <p className="text-text-secondary">데이터를 찾을 수 없습니다.</p>
        <Link to="/vocab" className="text-primary text-sm mt-4 inline-block no-underline">돌아가기</Link>
      </div>
    )
  }

  // ─── Card Mode ───
  if (mode === 'cards') {
    const item = words[cardIndex]
    return (
      <div className="max-w-lg mx-auto py-10 px-4">
        <Link to="/vocab" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline">
          <ArrowLeft size={16} /> 목록으로
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <span className={`px-2 py-0.5 rounded-md ${band.bg} text-xs font-bold ${band.color}`}>{band.label}</span>
          <span className="text-lg">{topic.emoji}</span>
          <span className="text-sm font-medium">{topic.name}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
          <span>{cardIndex + 1} / {words.length}</span>
          <span>카드를 탭하면 뒤집어집니다</span>
        </div>
        <div className="w-full h-1 bg-gray-100 rounded-full mb-6">
          <div className="h-1 bg-primary rounded-full transition-all" style={{ width: `${((cardIndex + 1) / words.length) * 100}%` }} />
        </div>

        {/* Card */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="relative w-full min-h-[280px] bg-surface rounded-2xl border border-border p-8 cursor-pointer hover:shadow-lg transition-all select-none"
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

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => { setCardIndex(Math.max(0, cardIndex - 1)); setFlipped(false) }}
            disabled={cardIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} /> 이전
          </button>

          {cardIndex === words.length - 1 ? (
            <button
              onClick={() => setMode('quiz')}
              className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              퀴즈 시작
            </button>
          ) : (
            <button
              onClick={() => { setCardIndex(cardIndex + 1); setFlipped(false) }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm hover:bg-gray-50 transition-colors"
            >
              다음 <ChevronRight size={16} />
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
        <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
          <div className="h-1 bg-violet-500 rounded-full transition-all" style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} />
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
            } else if (opt === selected) {
              style = 'bg-primary/10 border-primary'
            }

            return (
              <button
                key={i}
                onClick={() => {
                  if (showAnswer) return
                  setSelected(opt)
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

        <div className="mt-6 text-center">
          {!showAnswer ? (
            <button
              onClick={() => {
                if (!selected) return
                setShowAnswer(true)
                if (selected === q.correct) setScore(score + 1)
              }}
              disabled={!selected}
              className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-primary-dark transition-colors"
            >
              확인
            </button>
          ) : (
            <button
              onClick={() => {
                if (quizIndex === quizQuestions.length - 1) {
                  setMode('results')
                } else {
                  setQuizIndex(quizIndex + 1)
                  setSelected(null)
                  setShowAnswer(false)
                }
              }}
              className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              {quizIndex === quizQuestions.length - 1 ? '결과 보기' : '다음 문제'}
            </button>
          )}
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
          }}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={16} /> 다시 학습
        </button>
        <Link
          to="/vocab"
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium no-underline hover:bg-primary-dark transition-colors"
        >
          다른 주제 선택
        </Link>
      </div>
    </div>
  )
}
