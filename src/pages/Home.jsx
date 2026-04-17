import { Link } from 'react-router-dom'
import { PenLine, Mic, Upload, ArrowRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Star, ExternalLink, BookText, Users, FileText, Pin, MessageSquare } from 'lucide-react'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

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

      <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Link
          to="/writing/homework"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-primary hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <PenLine size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">Writing 제출</h2>
          <p className="text-text-secondary text-sm mb-4">
            AI powered + 강사가 직접 확인한 꼼꼼한 피드백 받아보세요.
          </p>
          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            제출하기 <ArrowRight size={14} />
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
          to="/vocab"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-violet-400 hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
            <BookText size={24} className="text-violet-600" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">단어 공부</h2>
          <p className="text-text-secondary text-sm mb-4">
            Band별 동의어를 카드로 학습하고 퀴즈로 확인하세요.
          </p>
          <span className="text-violet-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            시작하기 <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/store"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">E-Book 및 자료실</h2>
          <p className="text-text-secondary text-sm mb-4">
            IELTS 학습에 도움이 되는 전자책을 만나보세요.
          </p>
          <span className="text-emerald-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            둘러보기 <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/mock-test"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-amber-400 hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <FileText size={24} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">Mock Test</h2>
          <p className="text-text-secondary text-sm mb-4">
            실전과 동일한 IELTS 모의고사를 풀어보세요.
          </p>
          <span className="text-amber-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            입장하기 <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          to="/community"
          className="group bg-surface rounded-2xl border border-border p-8 no-underline text-left hover:border-blue-400 hover:shadow-lg transition-all flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
            <Users size={24} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">커뮤니티</h2>
          <p className="text-text-secondary text-sm mb-4">
            Q&A, 후기를 나누고 함께 준비해요.
          </p>
          <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            입장하기 <ArrowRight size={14} />
          </span>
        </Link>
      </div>

      {/* 시작 전 필독 */}
      <MustReadSection />

      {/* 이런 고민 섹션 */}
      <ConcernCarousel />

      {/* 수강생 후기 */}
      <ReviewCarousel />

      {/* 공부맵 미리보기 */}
      <StudyMapPreview />

    </div>
  )
}

const concerns = [
  'AI로 피드백 받아봤는데, 뭘 어떻게 물어봐야 점수가 오르는 피드백을 받는 건지 모르겠어요',
  '스피킹 연습하고 싶은데 할 곳이 마땅치 않아요',
  '해외에 있어서 학원을 다닐 수가 없어요',
  '혼자서 빠르게 점수 따고 싶은데 방법을 모르겠어요',
  '너무 바빠서 시간을 많이 할애할 수 없어요. 핵심만 확실히 알고싶어요.',
  '리딩, 리스닝은 혼자서 공부할 수 있는데 라이팅, 스피킹은 계속 점수가 안올라요.',
]

function ConcernCarousel() {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll)
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <div className="mt-20 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium mb-3">
          <PenLine size={14} /> For You
        </div>
        <h2 className="text-2xl font-bold mb-2">이런 고민, 혹시 나만 하는 걸까?</h2>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-text-secondary" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} className="text-text-secondary" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {concerns.map((text, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-72 bg-surface rounded-2xl border border-border p-6 flex items-center"
            >
              <p className="text-sm text-text leading-relaxed">"{text}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium">
          그래서 UpBand를 만들었어요.
        </div>
      </div>
    </div>
  )
}

const reviews = [
  { id: 1, name: '수강생 A', score: '7.5', detail: 'L 8.0 · R 8.0 · W 6.5 · S 7.0', text: '스피킹 피드백 주는대로 쏙쏙 가져가더니 역시! 완전 잘 나왔네요.' },
  { id: 2, name: '수강생 B', score: '6.5', detail: 'L 6.5 · R 6.5 · W 6.5 · S 6.0', text: '리테이크로 스피킹 다시 보면서 과외받고 바로 나와줌! 다행이다.' },
  { id: 3, name: '수강생 C', score: '7.5', detail: 'L 8.5 · R 8.5 · W 7.0 · S 6.0', text: '라이팅 7.0 받았어요! 그래도 점수 멋지다. 수고했다!' },
  { id: 4, name: '수강생 D', score: '6.5', detail: 'General Module · 한번에 합격', text: 'General module도 한번에 합격! 기분 좋아요.' },
  { id: 5, name: '수강생 E', score: '7.5', detail: 'L 7.5 · R 8.0 · W 6.5', text: '짧은 시간이었지만 덕분에 빨리 점수 올린 것 같아요. 감사합니다!' },
  { id: 6, name: '수강생 F', score: '6.5+', detail: '6시간 단기과외 · 1.5 이상 향상', text: '타학원에서 1개월 들었는데 점수 안 나와서 단기과외 받고 바로 향상!' },
]

function ReviewCarousel() {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll)
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <div className="mt-20 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium mb-3">
          <Star size={14} /> Reviews
        </div>
        <h2 className="text-2xl font-bold mb-2">실제 수강생 후기</h2>
        <p className="text-text-secondary text-sm">UpBand와 함께 목표 점수를 달성한 학생들</p>
      </div>

      <div className="relative">
        {/* 좌우 화살표 */}
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-text-secondary" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} className="text-text-secondary" />
          </button>
        )}

        {/* 카드 스크롤 */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map(r => (
            <div
              key={r.id}
              className="snap-start shrink-0 w-72 bg-surface rounded-2xl border border-border p-6 text-left"
            >
              {/* 점수 뱃지 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-primary leading-none">{r.score}</span>
                  <span className="text-[9px] text-primary/70">Band</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{r.name}</p>
                  <p className="text-[11px] text-text-secondary">{r.detail}</p>
                </div>
              </div>

              {/* 후기 텍스트 */}
              <p className="text-sm text-text leading-relaxed">"{r.text}"</p>

              {/* 별점 */}
              <div className="flex gap-0.5 mt-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인스타 링크 */}
      <div className="text-center mt-6">
        <a
          href="http://www.instagram.com/m_jy4278"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium no-underline hover:opacity-90 transition-opacity"
        >
          <ExternalLink size={16} /> 더 많은 후기 보기
        </a>
      </div>
    </div>
  )
}

function StudyMapPreview() {
  const { user } = useAuth()
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

        {/* CTA — 비회원만 */}
        {!user && (
          <Link
            to="/login"
            className="block w-full text-center py-3 bg-primary text-white rounded-xl font-medium text-sm no-underline hover:bg-primary-dark transition-colors"
          >
            무료로 시작하기
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── 시작 전 필독 섹션 ───
function MustReadSection() {
  const [guidePost, setGuidePost] = useState(null)
  const [reviewPost, setReviewPost] = useState(null)

  useEffect(() => {
    // Q&A에서 "어플처럼" 포함 글 찾기
    supabase
      .from('community_posts')
      .select('id, title')
      .eq('category', 'qna')
      .ilike('title', '%어플처럼%')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setGuidePost(data) })

    // 후기에서 "자료 및 피드백" 포함 글 찾기
    supabase
      .from('community_posts')
      .select('id, title')
      .eq('category', 'reviews')
      .ilike('title', '%자료 및 피드백%')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setReviewPost(data) })
  }, [])

  if (!guidePost && !reviewPost) return null

  return (
    <div className="mt-16 max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 mb-4">
        <Pin size={14} className="text-primary" />
        <span className="text-sm font-semibold text-primary">시작하기 전에 꼭 읽어주세요</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {guidePost && (
          <Link
            to={`/community/qna/${guidePost.id}`}
            className="group bg-surface rounded-2xl border border-border p-6 no-underline text-center hover:border-primary hover:shadow-lg transition-all"
          >
            <span className="text-3xl block mb-3">📱</span>
            <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-2">Q&A</span>
            <h3 className="font-semibold text-text text-sm mb-2">{guidePost.title}</h3>
            <span className="text-primary text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              읽으러 가기 <ArrowRight size={12} />
            </span>
          </Link>
        )}

        {reviewPost && (
          <Link
            to={`/community/reviews/${reviewPost.id}`}
            className="group bg-surface rounded-2xl border border-border p-6 no-underline text-center hover:border-amber-400 hover:shadow-lg transition-all"
          >
            <span className="text-3xl block mb-3">⭐</span>
            <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-medium mb-2">후기</span>
            <h3 className="font-semibold text-text text-sm mb-2">{reviewPost.title}</h3>
            <span className="text-amber-600 text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              읽으러 가기 <ArrowRight size={12} />
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
