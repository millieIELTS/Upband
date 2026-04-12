import { Link } from 'react-router-dom'
import { ArrowLeft, MessageCircleQuestion, Star, ArrowRight } from 'lucide-react'

const categories = [
  {
    id: 'qna',
    name: 'Q&A',
    description: 'IELTS 공부하면서 궁금한 점을 질문하세요',
    icon: MessageCircleQuestion,
    color: 'text-primary',
    bg: 'bg-primary/10',
    borderHover: 'hover:border-primary',
  },
  {
    id: 'reviews',
    name: '후기',
    description: '시험 후기, 공부 후기를 나눠보세요',
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    borderHover: 'hover:border-amber-400',
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
      <p className="text-text-secondary text-sm mb-8">
        IELTS 준비생들과 함께 정보를 나누고 응원해요
      </p>

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
