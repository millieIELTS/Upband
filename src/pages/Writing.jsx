import { Link } from 'react-router-dom'
import { BarChart3, FileText } from 'lucide-react'

export default function Writing() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Writing</h1>
      <p className="text-text-secondary mb-8">Task를 선택하세요.</p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
        <Link
          to="/writing/task1"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <BarChart3 size={28} className="text-primary mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Task 1</h2>
          <p className="text-text-secondary text-sm">
            그래프, 차트, 표, 다이어그램 등을 설명하는 150단어 이상의 리포트를 작성하세요.
          </p>
        </Link>

        <Link
          to="/writing/task2"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <FileText size={28} className="text-primary mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Task 2</h2>
          <p className="text-text-secondary text-sm">
            주어진 주제에 대해 자신의 의견을 논리적으로 전개하는 250단어 이상의 에세이를 작성하세요.
          </p>
        </Link>
      </div>
    </div>
  )
}
