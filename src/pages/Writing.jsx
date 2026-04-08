import { Link } from 'react-router-dom'
import { BarChart3, FileText, Upload } from 'lucide-react'

export default function Writing() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Writing 피드백</h1>
      <p className="text-text-secondary mb-8">Task를 선택하세요.</p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mb-8">
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

      <h2 className="text-lg font-bold mb-2">숙제 제출</h2>
      <p className="text-text-secondary text-sm mb-4">선생님이 내준 숙제를 제출하고 AI 피드백을 받으세요.</p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
        <Link
          to="/writing/homework/task1"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-accent/50 hover:shadow-lg transition-all"
        >
          <Upload size={28} className="text-accent mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Task 1 숙제</h2>
          <p className="text-text-secondary text-sm">
            선생님이 지정한 Task 1 문제에 대한 에세이를 제출하세요.
          </p>
        </Link>

        <Link
          to="/writing/homework/task2"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-accent/50 hover:shadow-lg transition-all"
        >
          <Upload size={28} className="text-accent mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Task 2 숙제</h2>
          <p className="text-text-secondary text-sm">
            선생님이 지정한 Task 2 문제에 대한 에세이를 제출하세요.
          </p>
        </Link>
      </div>
    </div>
  )
}
