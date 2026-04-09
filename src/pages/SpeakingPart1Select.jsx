import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { part1Topics } from '../data/speakingQuestions'

export default function SpeakingPart1Select() {
  const [done, setDone] = useState([])

  useEffect(() => {
    setDone(JSON.parse(localStorage.getItem('speaking_done_part1') || '[]'))
  }, [])

  return (
    <div>
      <Link
        to="/speaking"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> Part 선택으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-1">Speaking Part 1</h1>
      <p className="text-text-secondary text-sm mb-6">주제를 선택하세요. 각 주제에 {part1Topics[0]?.questions.length}개의 질문이 있습니다.</p>

      <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-w-lg">
        {part1Topics.map((topic) => {
          const completed = done.includes(topic.id)
          return (
            <Link
              key={topic.id}
              to={`/speaking/part1/${topic.id}`}
              className={`group rounded-xl border p-5 no-underline text-center hover:shadow-md transition-all ${
                completed
                  ? 'bg-green-50 border-green-300 hover:border-green-400'
                  : 'bg-surface border-border hover:border-primary'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                completed
                  ? 'bg-green-100 group-hover:bg-green-200'
                  : 'bg-primary/10 group-hover:bg-primary/20'
              }`}>
                {completed
                  ? <Check size={18} className="text-green-600" />
                  : <span className="text-lg font-bold text-primary">{topic.id}</span>
                }
              </div>
              <p className={`text-xs ${completed ? 'text-green-600' : 'text-text-secondary'}`}>
                {completed ? '완료' : `${topic.questions.length}문제`}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
