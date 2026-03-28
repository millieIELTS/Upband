import { Link } from 'react-router-dom'
import { PenLine, Mic, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  'IELTS 채점 기준 4개 항목별 Band 분석',
  '오류 인라인 교정 + Band 7 업그레이드 표현',
  '한국어로 쉽게 풀어주는 상세 피드백',
  '무료 3회 체험 가능',
]

export default function Home() {
  return (
    <div className="text-center py-12 sm:py-20">
      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
        AI-Powered IELTS Feedback
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
        <span className="text-primary">UpBand</span>
      </h1>
      <p className="text-lg sm:text-xl text-text mb-2">
        10년차 아이엘츠 전문강사의 피드백을 받아보세요
      </p>
      <p className="text-text-secondary mb-10">
        Writing & Speaking AI 피드백 플랫폼
      </p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
        <Link
          to="/writing"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <PenLine size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">Writing 피드백</h2>
          <p className="text-text-secondary text-sm mb-4">
            에세이를 입력하면 TA/CC/LR/GRA 4개 기준으로 Band 점수와 상세 피드백을 받으세요.
          </p>
          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            시작하기 <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/speaking"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Mic size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">Speaking 피드백</h2>
          <p className="text-text-secondary text-sm mb-4">
            질문을 듣고 녹음하면 Part 1/2/3별 맞춤 피드백과 모범 답안을 받으세요.
          </p>
          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            시작하기 <ArrowRight size={14} />
          </span>
        </Link>
      </div>

      {/* Features */}
      <div className="max-w-md mx-auto text-left">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 text-center">
          주요 기능
        </h3>
        <div className="space-y-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle size={18} className="text-success mt-0.5 shrink-0" />
              <span className="text-sm text-text">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
