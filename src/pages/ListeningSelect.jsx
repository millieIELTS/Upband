import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Headphones, ChevronRight, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LISTENING_BANDS, LISTENING_SENTENCES, LISTENING_TOPICS } from '../data/listeningSentences'
import { useListeningProgress } from '../hooks/useListeningProgress'

export default function ListeningSelect() {
  const { bandId } = useParams()
  const navigate = useNavigate()
  const { getProgress, loaded } = useListeningProgress()
  const [selectedBand, setSelectedBand] = useState(null)

  // URL 파라미터와 selectedBand 동기화
  useEffect(() => {
    if (bandId) {
      const found = LISTENING_BANDS.find((b) => b.id === bandId)
      setSelectedBand(found || null)
    } else {
      setSelectedBand(null)
    }
  }, [bandId])

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline">
        <ArrowLeft size={16} /> 홈으로
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
          <Headphones size={24} className="text-cyan-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Listening 연습</h1>
          <p className="text-sm text-text-secondary">IELTS 받아쓰기로 듣기 실력 up</p>
        </div>
      </div>

      {/* 안내 — Band 선택 화면일 때만 */}
      {!selectedBand && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 my-6 flex items-start gap-3">
          <Volume2 size={18} className="text-cyan-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-cyan-800">Dictation 방식 안내</p>
            <p className="text-xs text-cyan-700 mt-0.5 leading-relaxed">
              Band → 토픽 선택 → 문장 자동 재생 → 받아쓰기 → 단어 단위 채점.
              각 토픽마다 15문장이고, 중간에 나가도 멈춘 곳부터 다시 시작해요.
            </p>
          </div>
        </div>
      )}

      {/* Band 선택 화면 */}
      {!selectedBand ? (
        <>
          <p className="text-sm font-medium text-text-secondary mb-3 mt-6">난이도를 선택하세요</p>
          <div className="space-y-3">
            {LISTENING_BANDS.map((band) => (
              <button
                key={band.id}
                onClick={() => navigate(`/listening/${band.id}`)}
                className={`w-full bg-surface rounded-2xl border border-border p-5 ${band.borderHover} hover:shadow-md transition-all text-left`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`px-3 py-1.5 rounded-lg ${band.bg} font-bold ${band.color}`}>
                      {band.label}
                    </div>
                    <p className="text-sm font-semibold">{band.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-text-secondary shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        // 토픽 선택 화면
        <>
          <Link
            to="/listening"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 mt-2 no-underline"
          >
            <ArrowLeft size={14} /> 난이도 다시 선택
          </Link>

          <div className={`inline-block px-3 py-1 rounded-lg ${selectedBand.bg} font-bold ${selectedBand.color} text-sm mb-2`}>
            {selectedBand.label}
          </div>
          <p className="text-xs text-text-secondary mb-4">{selectedBand.description}</p>

          <p className="text-sm font-medium text-text-secondary mb-3">주제를 선택하세요</p>
          <div className="grid grid-cols-2 gap-3">
            {LISTENING_TOPICS.map((topic) => {
              const sentences = LISTENING_SENTENCES[selectedBand.id]?.[topic.id] || []
              const total = sentences.length
              const progress = loaded ? getProgress(selectedBand.id, topic.id) : 0
              const pct = total > 0 ? Math.round((progress / total) * 100) : 0
              const done = progress >= total && total > 0

              return (
                <Link
                  key={topic.id}
                  to={`/listening/${selectedBand.id}/${topic.id}`}
                  className={`flex items-center gap-3 p-4 bg-surface rounded-xl border border-border ${selectedBand.borderHover} hover:shadow-md transition-all no-underline`}
                >
                  <span className="text-2xl">{topic.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text text-sm">{topic.name}</p>
                    {progress > 0 ? (
                      <div className="mt-1.5">
                        <div className="w-full h-1 bg-gray-100 rounded-full">
                          <div
                            className={`h-1 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className={`text-[10px] mt-0.5 ${done ? 'text-emerald-600' : 'text-cyan-600'}`}>
                          {done ? '✓ 완료' : `${progress}/${total}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-text-secondary mt-0.5">{total}문장</p>
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
