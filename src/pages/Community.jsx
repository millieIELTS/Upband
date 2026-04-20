import { Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Star, ArrowRight, MessageCircle } from 'lucide-react'

const categories = [
  {
    id: 'reviews',
    name: '후기',
    description: '시험 후기, 공부 후기를 나눠보세요',
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    borderHover: 'hover:border-amber-400',
  },
  {
    id: 'tips',
    name: '공부팁',
    description: '나만의 IELTS 공부법과 꿀팁을 공유해보세요',
    icon: Lightbulb,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    borderHover: 'hover:border-emerald-400',
  },
]

export default function Community() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline"
      >
        <ArrowLeft size={16} /> 홈으로
      </Link>

      <h1 className="text-2xl font-bold mb-2">커뮤니티</h1>
      <p className="text-text-secondary text-sm mb-6">
        IELTS 준비생들과 함께 정보를 나누고 응원해요
      </p>

      {/* 카톡 문의 안내 */}
      <a
        href="http://pf.kakao.com/_xbKxlCX"
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 no-underline hover:border-yellow-400 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
          <MessageCircle size={20} className="text-yellow-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-yellow-900">개별 질문은 카톡으로 문의해주세요</p>
          <p className="text-xs text-yellow-800/80 mt-0.5">
            점수·공부 고민·에세이 피드백 요청은 밀리쌤이 1:1로 답변드려요
          </p>
        </div>
        <ArrowRight size={16} className="text-yellow-700 shrink-0" />
      </a>

      <div className="grid gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.id}
              to={`/community/${cat.id}`}
              className={`group bg-surface rounded-2xl border border-border p-6 no-underline flex items-center gap-5 ${cat.borderHover} hover:shadow-lg transition-all`}
            >
              <div className={`w-14 h-14 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                <Icon size={28} className={cat.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-text mb-1">{cat.name}</h2>
                <p className="text-text-secondary text-sm">{cat.description}</p>
              </div>
              <ArrowRight size={18} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
