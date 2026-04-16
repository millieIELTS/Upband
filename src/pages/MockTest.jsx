import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Lock, Clock } from 'lucide-react'

const tests = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  label: `${i + 1}회`,
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
            <p className="text-sm text-text-secondary">IELTS Writing 실전 모의고사</p>
          </div>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">문제 업데이트 예정</p>
          <p className="text-xs text-amber-600 mt-0.5">곧 실전과 동일한 모의고사가 추가됩니다. 조금만 기다려주세요!</p>
        </div>
      </div>

      {/* 10회 목록 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {tests.map((test) => (
          <div
            key={test.id}
            className="relative bg-surface rounded-xl border border-border p-5 text-center opacity-60 cursor-not-allowed"
          >
            <Lock size={16} className="text-text-secondary mx-auto mb-2" />
            <p className="text-lg font-bold text-text">{test.label}</p>
            <p className="text-[11px] text-text-secondary mt-1">준비중</p>
          </div>
        ))}
      </div>
    </div>
  )
}
