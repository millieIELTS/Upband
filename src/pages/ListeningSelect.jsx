import { Link } from 'react-router-dom'
import { ArrowLeft, Headphones, ChevronRight, Volume2 } from 'lucide-react'
import { LISTENING_BANDS, LISTENING_SENTENCES } from '../data/listeningSentences'

export default function ListeningSelect() {
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

      {/* 안내 */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 my-6 flex items-start gap-3">
        <Volume2 size={18} className="text-cyan-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-cyan-800">Dictation 방식 안내 (무료 · 토큰 차감 없음)</p>
          <p className="text-xs text-cyan-700 mt-0.5 leading-relaxed">
            문장이 자동 재생돼요 → 들은 대로 타이핑하세요 → 채점하면 정답과 비교해 맞은/틀린 단어가 표시돼요.
            몇 번이든 다시 들으며 반복 연습할 수 있어요.
          </p>
        </div>
      </div>

      {/* Band 선택 */}
      <p className="text-sm font-medium text-text-secondary mb-3">난이도를 선택하세요</p>
      <div className="space-y-3">
        {LISTENING_BANDS.map((band) => {
          const count = LISTENING_SENTENCES[band.id]?.length || 0
          return (
            <Link
              key={band.id}
              to={`/listening/${band.id}`}
              className={`flex items-center justify-between bg-surface rounded-2xl border border-border p-5 no-underline text-text ${band.borderHover} hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`px-3 py-1.5 rounded-lg ${band.bg} font-bold ${band.color}`}>
                  {band.label}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{band.description}</p>
                  <p className="text-xs text-text-secondary mt-0.5">총 {count}문장</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
