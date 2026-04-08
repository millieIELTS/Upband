import { Link } from 'react-router-dom'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { part1Topics } from '../data/speakingQuestions'

export default function SpeakingPart1Select() {
  return (
    <div>
      <Link
        to="/speaking"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> Part 선택으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-1">Speaking Part 1</h1>
      <p className="text-text-secondary text-sm mb-6">주제를 선택하세요. 각 주제에 4개의 질문이 있습니다.</p>

      <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-w-lg">
        {part1Topics.map((topic) => (
          <Link
            key={topic.id}
            to={`/speaking/part1/${topic.id}`}
            className="group bg-surface rounded-xl border border-border p-5 no-underline text-center hover:border-primary hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
              <span className="text-lg font-bold text-primary">{topic.id}</span>
            </div>
            <p className="text-xs text-text-secondary">{topic.questions.length}문제</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
