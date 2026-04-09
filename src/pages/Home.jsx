import { Link } from 'react-router-dom'
import { PenLine, Mic, Upload, ArrowRight, BookOpen } from 'lucide-react'

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <Link
          to="/writing"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-primary hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <PenLine size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">Writing Mock Test</h2>
          <p className="text-text-secondary text-sm mb-4">
            에세이를 입력하면 TA/CC/LR/GRA 4개 기준으로 Band 점수와 상세 피드백을 받으세요. (피드백기능 업데이트 예정)
          </p>
          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            시작하기 <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/speaking"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-primary hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Mic size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">Speaking</h2>
          <p className="text-text-secondary text-sm mb-4">
            질문을 듣고 연습해보세요. (녹음기능 업데이트 예정)
          </p>
          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            시작하기 <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/writing/homework"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-accent/50 hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
            <Upload size={24} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">Writing</h2>
          <p className="text-text-secondary text-sm mb-4">
            AI powered + 강사가 직접 확인한 꼼꼼한 피드백 받아보세요.
          </p>
          <span className="text-accent text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            제출하기 <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/store"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">E-Book</h2>
          <p className="text-text-secondary text-sm mb-4">
            IELTS 학습에 도움이 되는 전자책을 만나보세요.
          </p>
          <span className="text-emerald-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            둘러보기 <ArrowRight size={14} />
          </span>
        </Link>
      </div>

    </div>
  )
}
