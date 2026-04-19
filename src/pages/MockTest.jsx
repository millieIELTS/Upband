import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Clock, ChevronRight } from 'lucide-react'

const fullMockTests = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  label: `Writing Mock Test ${i + 1}회`,
  available: true,
}))

export default function MockTest() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline"
      >
        <ArrowLeft size={16} /> 홈으로
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <FileText size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Writing Mock Test</h1>
            <p className="text-sm text-text-secondary">IELTS Writing 실전 모의고사</p>
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">모의고사 안내 (−1 토큰)</p>
          <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
            한 회차는 <b>Task 1 + Task 2</b>를 60분 안에 작성하는 Writing 모의고사예요.
            실제 시험과 동일한 형식·시간으로 응시하시고, 제출 후 선생님의 피드백을 받아보세요.
            제출 시 <b>1 토큰</b>이 차감됩니다.
          </p>
        </div>
      </div>

      {/* 응시 가능 회차 */}
      <div className="space-y-2 mb-6">
        {fullMockTests.map((test) => (
          <Link
            key={test.id}
            to={`/mock-test/writing/${test.id}`}
            className="flex items-center justify-between bg-surface rounded-xl border border-border p-4 hover:border-primary hover:shadow-sm transition-all no-underline text-text"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{test.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">60분</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-secondary shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
