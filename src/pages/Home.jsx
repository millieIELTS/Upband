import { Link } from 'react-router-dom'
import { PenLine, Mic, Upload, ArrowRight, BookOpen, CalendarDays } from 'lucide-react'
import { useMemo } from 'react'

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
        Writing & Speaking 피드백 플랫폼
      </p>
      <p className="text-text-secondary mb-10 max-w-lg mx-auto">
        AI의 꼼꼼함 + 10년차 아이엘츠 전문강사가 주는 방향성과 공부 흐름 피드백
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

      {/* 공부맵 미리보기 */}
      <StudyMapPreview />

    </div>
  )
}

function StudyMapPreview() {
  // 샘플 데이터: 최근 12주 활동량
  const weeks = useMemo(() => {
    const data = []
    const today = new Date()
    for (let w = 11; w >= 0; w--) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(today)
        date.setDate(date.getDate() - (w * 7 + (6 - d)))
        // 샘플 활동량 (패턴 있게)
        const seed = (date.getDate() * 7 + date.getMonth() * 13) % 10
        let count = 0
        if (w < 10) { // 최근일수록 활동 많게
          if (seed > 6) count = 3
          else if (seed > 4) count = 2
          else if (seed > 2) count = 1
        }
        if (w < 4 && seed > 1) count = Math.min(count + 1, 3) // 최근 4주 더 활발
        week.push({ date, count })
      }
      data.push(week)
    }
    return data
  }, [])

  const cellColor = (count) => {
    if (count === 0) return 'bg-gray-100'
    if (count === 1) return 'bg-green-200'
    if (count === 2) return 'bg-green-400'
    return 'bg-green-600'
  }

  return (
    <div className="mt-20 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium mb-3">
          <CalendarDays size={14} /> Study Map
        </div>
        <h2 className="text-2xl font-bold mb-2">나만의 공부맵을 만들어보세요</h2>
        <p className="text-text-secondary text-sm">매일의 연습이 쌓여 Band 점수로 이어집니다</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8">
        {/* 샘플 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">12일</p>
            <p className="text-xs text-text-secondary">연속 학습</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">28회</p>
            <p className="text-xs text-text-secondary">이번 달 연습</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">6.5</p>
            <p className="text-xs text-text-secondary">최근 Band</p>
          </div>
        </div>

        {/* 달력 히트맵 */}
        <div className="mb-6">
          <div className="flex justify-center gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm ${cellColor(day.count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-1 mt-2 text-xs text-text-secondary">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <div className="w-3 h-3 rounded-sm bg-green-200" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-600" />
            <span>More</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/login"
          className="block w-full text-center py-3 bg-primary text-white rounded-xl font-medium text-sm no-underline hover:bg-primary-dark transition-colors"
        >
          무료로 시작하기
        </Link>
      </div>
    </div>
  )
}
