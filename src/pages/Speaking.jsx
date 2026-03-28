import { Link } from 'react-router-dom'
import { Volume2, Eye, MessageSquare } from 'lucide-react'

export default function Speaking() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Speaking 피드백</h1>
      <p className="text-text-secondary mb-8">Part를 선택하세요.</p>

      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl">
        <Link
          to="/speaking/part1"
          className="group bg-surface rounded-2xl border border-border p-6 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <Volume2 size={28} className="text-primary mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Part 1</h2>
          <p className="text-text-secondary text-sm">
            질문 음성을 듣고 바로 답변을 녹음하세요. 일상적인 주제에 대한 짧은 답변입니다.
          </p>
        </Link>

        <Link
          to="/speaking/part2"
          className="group bg-surface rounded-2xl border border-border p-6 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <Eye size={28} className="text-primary mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Part 2</h2>
          <p className="text-text-secondary text-sm">
            주제 카드를 보고 1분 준비 후 2분간 스피치를 녹음하세요.
          </p>
        </Link>

        <Link
          to="/speaking/part3"
          className="group bg-surface rounded-2xl border border-border p-6 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <MessageSquare size={28} className="text-primary mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Part 3</h2>
          <p className="text-text-secondary text-sm">
            질문 음성을 듣고 심화 답변을 녹음하세요. Part 2 주제와 연관된 토론형 질문입니다.
          </p>
        </Link>
      </div>
    </div>
  )
}
