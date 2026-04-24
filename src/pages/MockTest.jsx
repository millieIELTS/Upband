import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Mic, ChevronRight, MessageSquareHeart } from 'lucide-react'

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
        <p className="text-sm text-text-secondary mt-4 leading-relaxed">
          Writing과 Speaking 두 가지 모의고사가 준비되어 있어요. 원하는 영역을 선택해주세요.
        </p>
      </div>

      {/* 강사 피드백 안내 배너 */}
      <div className="flex items-start gap-3 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <MessageSquareHeart size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text mb-1">
            밀리쌤이 직접 꼼꼼히 보고 피드백 드려요
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">
            제출하신 Writing 모의고사는 강사가 한 문장 한 문장 직접 검토 후,
            개별 피드백을 제공합니다. 시간이 조금 걸리더라도 정확하고 실질적인 조언을 받아보세요.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Writing */}
        <Link
          to="/mock-test/writing"
          className="flex items-start gap-4 bg-surface rounded-xl border border-border p-5 hover:border-amber-400 hover:shadow-sm transition-all no-underline text-text"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-semibold">Writing Mock Test</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                제출 시 −1 토큰
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              실제 시험처럼 Task 1 + Task 2를 60분 안에 작성하고, 제출 후 선생님 피드백을 받아요.
            </p>
          </div>
          <ChevronRight size={18} className="text-text-secondary shrink-0 mt-1" />
        </Link>

        {/* Speaking */}
        <Link
          to="/mock-test/speaking"
          className="flex items-start gap-4 bg-surface rounded-xl border border-border p-5 hover:border-primary hover:shadow-sm transition-all no-underline text-text"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Mic size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-semibold">Speaking Mock Test</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                무료 · 토큰 차감 없음
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Part 1·2·3 질문이 자동 재생되고, 스스로 녹음하며 연습하는 자율 학습 모드예요.
            </p>
          </div>
          <ChevronRight size={18} className="text-text-secondary shrink-0 mt-1" />
        </Link>
      </div>
    </div>
  )
}
