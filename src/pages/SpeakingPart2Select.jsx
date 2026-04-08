import { Link } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import { part2Part3Topics } from '../data/speakingQuestions'

export default function SpeakingPart2Select() {
  return (
    <div>
      <Link
        to="/speaking"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> Part 선택으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-1">Speaking Part 2</h1>
      <p className="text-text-secondary text-sm mb-6">주제를 선택하세요. 1분 준비 후 2분 스피치입니다.</p>

      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
        {part2Part3Topics.map((topic) => (
          <Link
            key={topic.id}
            to={`/speaking/part2/${topic.id}`}
            className="group bg-surface rounded-xl border border-border p-4 no-underline text-left hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <span className="text-sm font-bold text-primary">{topic.id}</span>
              </div>
              <h3 className="text-sm font-medium text-text">{topic.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
