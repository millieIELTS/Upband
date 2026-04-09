import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Check } from 'lucide-react'
import { part3Topics } from '../data/speakingQuestions'

export default function SpeakingPart3Select() {
  const [done, setDone] = useState([])

  useEffect(() => {
    setDone(JSON.parse(localStorage.getItem('speaking_done_part3') || '[]'))
  }, [])

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
        {part3Topics.map((topic) => {
          const completed = done.includes(topic.id)
          return (
            <Link
              key={topic.id}
              to={`/speaking/part3/${topic.id}`}
              className={`group rounded-xl border p-5 no-underline text-left hover:shadow-md transition-all ${
                completed
                  ? 'bg-green-50 border-green-300 hover:border-green-400'
                  : 'bg-surface border-border hover:border-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  completed
                    ? 'bg-green-100 group-hover:bg-green-200'
                    : 'bg-primary/10 group-hover:bg-primary/20'
                }`}>
                  {completed
                    ? <Check size={18} className="text-green-600" />
                    : <MessageSquare size={18} className="text-primary" />
                  }
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${completed ? 'text-green-700' : 'text-text'}`}>{topic.name}</h3>
                  <p className={`text-xs ${completed ? 'text-green-600' : 'text-text-secondary'}`}>Part 2-{topic.id} 연계 · {topic.questions.length}문제</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
