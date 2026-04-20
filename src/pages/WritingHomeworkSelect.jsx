import { Link } from 'react-router-dom'
import { BarChart3, FileText, ArrowLeft, Coins } from 'lucide-react'

export default function WritingHomeworkSelect() {
  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> 홈으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-2">Writing</h1>
      <p className="text-text-secondary mb-4">(AI 채점 후 강사님이 매의 눈으로 검토하여 꼼꼼하게 피드백 나갑니다.)</p>

      <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-8">
        <Coins size={14} className="text-amber-600" />
        <span className="text-xs text-amber-700">
          제출 시 <b>1 크레딧</b>이 차감돼요.
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
        <Link
          to="/writing/homework/task1"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-accent/50 hover:shadow-lg transition-all"
        >
          <BarChart3 size={28} className="text-accent mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Task 1</h2>
          <p className="text-text-secondary text-sm">
            그래프/차트 문제에 대한 리포트를 제출하세요.
          </p>
        </Link>

        <Link
          to="/writing/homework/task2"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-accent/50 hover:shadow-lg transition-all"
        >
          <FileText size={28} className="text-accent mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Task 2</h2>
          <p className="text-text-secondary text-sm">
            에세이 주제에 대한 글을 제출하세요.
          </p>
        </Link>
      </div>
    </div>
  )
}
