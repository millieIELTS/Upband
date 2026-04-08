import { Link } from 'react-router-dom'
import { BarChart3, FileText, ArrowLeft } from 'lucide-react'

export default function WritingHomeworkSelect() {
  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> 홈으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-2">숙제 제출</h1>
      <p className="text-text-secondary mb-8">Task를 선택하세요.</p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
        <Link
          to="/writing/homework/task1"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-accent/50 hover:shadow-lg transition-all"
        >
          <BarChart3 size={28} className="text-accent mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Task 1 숙제</h2>
          <p className="text-text-secondary text-sm">
            선생님이 지정한 그래프/차트 문제에 대한 리포트를 제출하세요.
          </p>
        </Link>

        <Link
          to="/writing/homework/task2"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-accent/50 hover:shadow-lg transition-all"
        >
          <FileText size={28} className="text-accent mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Task 2 숙제</h2>
          <p className="text-text-secondary text-sm">
            선생님이 지정한 에세이 주제에 대한 글을 제출하세요.
          </p>
        </Link>
      </div>
    </div>
  )
}
