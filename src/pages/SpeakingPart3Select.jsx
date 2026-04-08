import { Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { part3Topics } from '../data/speakingQuestions'

export default function SpeakingPart3Select() {
  return (
    <div>
      <Link
        to="/speaking"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> Part 선택으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-1">Speaking Part 3</h1>
      <p className="text-text-secondary text-sm mb-6">주제를 선택하세요. 심화 토론 질문입니다.</p>

      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
        {part3Topics.map((topic) => (
          <Link
            key={topic.id}
            to={`/speaking/part3/${topic.id}`}
            className="group bg-surface rounded-xl border border-border p-5 no-underline text-left hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <MessageSquare size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">{topic.name}</h3>
                <p className="text-xs text-text-secondary">{topic.questions.length}문제</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
