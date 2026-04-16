import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { bandLevels, topics, synonymData } from '../data/synonyms'
import { useVocabProgress } from '../hooks/useVocabProgress'

export default function VocabSelect() {
  const { bandId } = useParams()
  const navigate = useNavigate()
  const [selectedBand, setSelectedBand] = useState(null)
  const { getProgress } = useVocabProgress()

  // URL 파라미터와 selectedBand 동기화
  useEffect(() => {
    if (bandId) {
      const found = bandLevels.find(b => b.id === bandId)
      setSelectedBand(found || null)
    } else {
      setSelectedBand(null)
    }
  }, [bandId])

  const handleBandSelect = (band) => {
    navigate(`/vocab/${band.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-8 no-underline">
        <ArrowLeft size={16} /> 홈으로
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <BookOpen size={20} className="text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold">단어 공부</h1>
      </div>
      <p className="text-text-secondary text-sm mb-8">Band 수준별 동의어를 학습하고 마지막에 퀴즈로 확인하세요</p>

      {/* Band Level Selection */}
      {!selectedBand ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-secondary mb-2">Band 수준을 선택하세요</p>
          {bandLevels.map(band => (
            <button
              key={band.id}
              onClick={() => handleBandSelect(band)}
              className="w-full flex items-center justify-between p-5 bg-surface rounded-2xl border border-border hover:border-primary hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1.5 rounded-lg ${band.bg} font-bold text-lg ${band.color}`}>
                  {band.label}
                </div>
                <span className="text-sm text-text-secondary">
                  {band.id === 'band56' && '기초 단어를 다양하게 표현하기'}
                  {band.id === 'band67' && '중급 어휘로 레벨업'}
                  {band.id === 'band7plus' && '고급 어휘와 정확한 표현'}
                </span>
              </div>
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Back to band selection */}
          <Link
            to="/vocab"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
          >
            <ArrowLeft size={14} /> Band 수준 다시 선택
          </Link>

          <div className={`inline-block px-3 py-1 rounded-lg ${selectedBand.bg} font-bold ${selectedBand.color} text-sm mb-6`}>
            {selectedBand.label}
          </div>

          <p className="text-sm font-medium text-text-secondary mb-3">주제를 선택하세요</p>
          <div className="grid grid-cols-2 gap-3">
            {topics.map(topic => {
              const words = synonymData[selectedBand.id]?.[topic.id] || []
              const progress = getProgress(selectedBand.id, topic.id)
              const total = words.length
              const pct = total > 0 ? Math.round((progress / total) * 100) : 0

              return (
                <Link
                  key={topic.id}
                  to={`/vocab/${selectedBand.id}/${topic.id}`}
                  className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border hover:border-primary hover:shadow-md transition-all no-underline"
                >
                  <span className="text-2xl">{topic.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text text-sm">{topic.name}</p>
                    {progress > 0 && (
                      <div className="mt-1.5">
                        <div className="w-full h-1 bg-gray-100 rounded-full">
                          <div className="h-1 bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-green-600 mt-0.5">{progress}/{total}</p>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
