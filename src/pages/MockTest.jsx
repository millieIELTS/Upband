import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Lock, Clock, ChevronRight } from 'lucide-react'

const fullMockTests = [
  { id: '1', label: 'Mock Test 1회', available: true },
]

const lockedTests = Array.from({ length: 9 }, (_, i) => ({
  id: i + 2,
  label: `${i + 2}회`,
  available: false,
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
            <h1 className="text-2xl font-bold">Mock Test</h1>
            <p className="text-sm text-text-secondary">IELTS 실전 모의고사</p>
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">모의고사 안내</p>
          <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
            한 회차를 시작하면 <b>Writing</b>을 먼저 진행하고, 이어서 <b>Speaking</b>이 자동으로 시작됩니다.
            실제 시험과 동일한 형식·시간으로 응시하시고, 제출 후 선생님의 피드백을 받아보세요.
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{test.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">Writing (60분) → Speaking (Part 1·2·3)</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-secondary" />
          </Link>
        ))}
      </div>

      {/* 준비중 회차 */}
      <h2 className="text-sm font-semibold text-text-secondary mb-3">준비중</h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {lockedTests.map((test) => (
          <div
            key={test.id}
            className="relative bg-surface rounded-xl border border-border p-4 text-center opacity-60 cursor-not-allowed"
          >
            <Lock size={14} className="text-text-secondary mx-auto mb-1" />
            <p className="text-sm font-bold text-text">{test.label}</p>
            <p className="text-[10px] text-text-secondary mt-0.5">준비중</p>
          </div>
        ))}
      </div>
    </div>
  )
}
