import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BookOpen, Download, Coins, Lock, ArrowLeft, MessageSquare, Target, List, Eye, Sparkles, CheckCircle2, Users,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

/**
 * ⚠️ 예시 페이지입니다.
 * 현재는 모든 자료에 동일한 placeholder가 표시됩니다.
 * 확정되면 ebooks 테이블에 teacher_note, recommended_for, toc, preview_images 컬럼을 추가하고
 * 관리자 페이지에서 자료별로 편집하도록 연결할 예정이에요.
 */
const DEMO = {
  teacherNote: `안녕하세요, 밀리예요 🙋‍♀️\n\n이 자료는 제가 IELTS 수업하면서 "이 단어 몰라서 점수 깎이는 학생이 너무 많다" 싶은 것만 엄선했어요.\n\n무작정 외우는 것보다, 문장 속에서 어떻게 쓰이는지 보면서 익혀야 시험장에서 꺼내 쓸 수 있어요. 하루 20개씩만 하셔도 한 달이면 완주할 수 있는 분량이에요!`,
  recommendedFor: [
    'Band 6.0 → 6.5/7.0 목표로 단어 부족 느끼시는 분',
    'Cambridge IELTS 문제집을 풀면서 몰랐던 단어를 정리하고 싶은 분',
    '시험 직전 단어만 집중적으로 빠르게 복습하고 싶은 분',
  ],
  toc: [
    'Chapter 1. Cambridge 10 — Reading/Listening 빈출 어휘',
    'Chapter 2. Cambridge 11~13 — 주제별 테마 어휘',
    'Chapter 3. Cambridge 14~17 — 고난도 아카데믹 어휘',
    'Chapter 4. Cambridge 18~20 — 최신 기출 어휘',
    '부록. 헷갈리는 동의어 비교표',
  ],
  learnings: [
    '시험에 실제로 출제된 어휘 위주 학습',
    '문맥 속 예문으로 자연스러운 사용법 체득',
    '유의어 묶음 학습으로 Writing/Speaking 표현력 확장',
  ],
  downloadCount: 48, // 예시 숫자
}

const REASON_MSG = {
  insufficient_credits: (d) => `크레딧이 부족해요. (보유: ${d.credits} / 필요: ${d.price})`,
  ebook_not_found: () => '자료를 찾을 수 없어요.',
  not_authenticated: () => '로그인이 필요해요.',
}

export default function StoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPurchased, setIsPurchased] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle()
    setBook(data)

    if (user && data) {
      if (data.price === 0) {
        setIsPurchased(true)
      } else {
        const { data: purchase } = await supabase
          .from('ebook_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('ebook_id', id)
          .maybeSingle()
        setIsPurchased(!!purchase)
      }
    }
    setLoading(false)
  }, [id, user])

  useEffect(() => { load() }, [load])

  const handleDownload = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setProcessing(true)
    setMessage(null)

    const { data, error } = await supabase.rpc('purchase_ebook', { p_ebook_id: id })
    setProcessing(false)

    if (error || !data?.success) {
      const msg = REASON_MSG[data?.error]?.(data) || '오류가 발생했어요. 다시 시도해 주세요.'
      setMessage({ type: 'error', text: msg })
      return
    }

    if (!data.already_purchased && book.price > 0) {
      await refreshProfile()
      setMessage({ type: 'success', text: `${book.price} 크레딧이 차감됐어요.` })
    }
    setIsPurchased(true)

    const a = document.createElement('a')
    a.href = `${data.file_url}?download=`
    a.click()
  }

  if (loading) return <div className="text-center py-16 text-text-secondary">불러오는 중...</div>
  if (!book) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary mb-4">자료를 찾을 수 없어요.</p>
        <Link to="/store" className="text-primary no-underline">자료실로 돌아가기</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 뒤로가기 */}
      <Link to="/store" className="inline-flex items-center gap-1 text-sm text-text-secondary mb-6 no-underline hover:text-primary">
        <ArrowLeft size={14} /> 자료실
      </Link>

      {/* 상단: 커버 + 구매 */}
      <div className="grid md:grid-cols-[240px,1fr] gap-6 mb-10">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-full aspect-[3/4] rounded-2xl object-cover shadow-md" />
        ) : (
          <div className="w-full aspect-[3/4] rounded-2xl bg-primary/5 flex items-center justify-center">
            <BookOpen size={56} className="text-primary/30" />
          </div>
        )}

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold mb-2 leading-tight">{book.title}</h1>
          {book.description && (
            <p className="text-text-secondary text-sm mb-4 whitespace-pre-line">{book.description}</p>
          )}

          <div className="flex items-center gap-1 text-text-secondary text-xs mb-4">
            <Users size={13} />
            이미 <span className="font-semibold text-text">{DEMO.downloadCount}명</span>이 다운받았어요
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-2xl font-bold text-primary">
              {book.price === 0 ? '무료' : (
                <>
                  <Coins size={22} className="text-accent" />
                  {book.price.toLocaleString()}
                </>
              )}
            </span>
          </div>

          {message && (
            <p className={`text-xs mb-3 ${message.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
              {message.text}
            </p>
          )}

          <button
            onClick={handleDownload}
            disabled={processing}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {processing ? (
              <span className="animate-pulse">처리 중...</span>
            ) : isPurchased ? (
              <><Download size={16} /> 다운로드</>
            ) : (
              <><Lock size={16} /> 구매하고 다운받기</>
            )}
          </button>

          {!isPurchased && book.price > 0 && user && (
            <p className="text-xs text-text-secondary mt-2 text-center">
              보유 크레딧: <span className="font-medium text-text">{profile?.credits ?? 0}</span>
            </p>
          )}
        </div>
      </div>

      {/* 예시 배너 */}
      <div className="mb-8 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
        ⚠️ 아래 섹션은 <b>예시</b>입니다. 확정되면 자료마다 편집 가능하게 연결해 드릴게요.
      </div>

      {/* 강사의 한마디 */}
      <Section icon={MessageSquare} title="강사의 한마디" color="primary">
        <p className="text-sm text-text leading-relaxed whitespace-pre-line">{DEMO.teacherNote}</p>
      </Section>

      {/* 이런 분께 추천 */}
      <Section icon={Target} title="이런 분께 추천해요" color="emerald">
        <ul className="space-y-2">
          {DEMO.recommendedFor.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* 목차 */}
      <Section icon={List} title="목차" color="indigo">
        <ol className="space-y-2">
          {DEMO.toc.map((item, i) => (
            <li key={i} className="text-sm text-text flex gap-3">
              <span className="text-text-secondary shrink-0">{String(i + 1).padStart(2, '0')}</span>
              {item}
            </li>
          ))}
        </ol>
      </Section>

      {/* 미리보기 */}
      <Section icon={Eye} title="미리보기" color="rose">
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="aspect-[3/4] rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-border"
            >
              <div className="text-center p-6">
                <Eye size={32} className="text-text-secondary mx-auto mb-2" />
                <p className="text-xs text-text-secondary">미리보기 페이지 {n}</p>
                <p className="text-[10px] text-text-secondary mt-1">(업로드 예정)</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 이런 걸 배울 수 있어요 */}
      <Section icon={Sparkles} title="이런 걸 배울 수 있어요" color="amber">
        <ul className="space-y-2">
          {DEMO.learnings.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Sparkles size={16} className="text-amber-500 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* 하단 재구매 CTA */}
      <div className="sticky bottom-4 mt-10 p-4 bg-surface border border-border rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{book.title}</p>
          <p className="text-xs text-text-secondary">
            {book.price === 0 ? '무료' : `${book.price} 크레딧`}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={processing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isPurchased ? <><Download size={14} /> 다운로드</> : <><Lock size={14} /> 구매하기</>}
        </button>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, color, children }) {
  const bg = {
    primary: 'bg-primary/5 text-primary',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    rose: 'bg-rose-50 text-rose-500',
    amber: 'bg-amber-50 text-amber-600',
  }[color]

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon size={16} />
        </div>
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="pl-10">{children}</div>
    </section>
  )
}
