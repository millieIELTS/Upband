import { Link } from 'react-router-dom'
import { ArrowLeft, Mic, Clock, ChevronRight } from 'lucide-react'
import { SPEAKING_MOCK_TESTS } from '../data/speakingMockTests'

export default function MockTestSpeakingList() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        to="/mock-test"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline"
      >
        <ArrowLeft size={16} /> Mock Test 홈으로
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mic size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Speaking Mock Test</h1>
            <p className="text-sm text-text-secondary">IELTS Speaking 자율 모의고사</p>
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Clock size={18} className="text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-800">Speaking 모의고사 안내 (무료)</p>
          <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
            Part 1 → Part 2 → Part 3 순서로 진행돼요. 질문은 AI 음성으로 자동 재생되고,
            본인 답변은 스스로 녹음·재생하며 연습할 수 있어요.
            제출이나 제출 기록 없이 <b>토큰 차감도 없으니</b> 자유롭게 반복 연습해보세요.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {SPEAKING_MOCK_TESTS.map((test) => (
          <Link
            key={test.id}
            to={`/mock-test/speaking/${test.id}`}
            className="flex items-center justify-between bg-surface rounded-xl border border-border p-4 hover:border-primary hover:shadow-sm transition-all no-underline text-text"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mic size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">Speaking Mock Test {test.id}회</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  시작하면 주제가 공개돼요
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-secondary shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
