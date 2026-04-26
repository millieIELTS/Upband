import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BookOpen, Download, Lock, ArrowLeft, MessageSquare, Target, List, Eye, Sparkles, CheckCircle2, Loader2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { purchaseEbook } from '../lib/payment'
import PaymentMethodSheet from '../components/PaymentMethodSheet'

export default function StoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPurchased, setIsPurchased] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState(null)
  const [showPaySheet, setShowPaySheet] = useState(false)

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

  const triggerDownload = (fileUrl) => {
    const a = document.createElement('a')
    a.href = `${fileUrl}?download=`
    a.click()
  }

  const handleDownload = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    // 무료 또는 이미 구매: purchase_ebook RPC 호출
    if (book.price === 0 || isPurchased) {
      setProcessing(true)
      setMessage(null)

      const { data, error } = await supabase.rpc('purchase_ebook', { p_ebook_id: id })
      setProcessing(false)

      if (error || !data?.success) {
        setMessage({ type: 'error', text: '오류가 발생했어요. 다시 시도해 주세요.' })
        return
      }

      setIsPurchased(true)
      triggerDownload(data.file_url)
      return
    }

    // 유료 자료 → 결제 모달
    setShowPaySheet(true)
  }

  const handlePaymentMethod = async (payMethod) => {
    setShowPaySheet(false)
    setProcessing(true)
    setMessage(null)

    try {
      const result = await purchaseEbook(id, payMethod)
      if (result.success) {
        setIsPurchased(true)
        setMessage({ type: 'success', text: '🎉 결제 완료! 다운로드를 시작합니다.' })
        if (result.file_url) triggerDownload(result.file_url)
      } else {
        if (!/취소/.test(result.error || '')) {
          setMessage({ type: 'error', text: '결제 실패: ' + result.error })
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: '결제 중 오류: ' + err.message })
    } finally {
      setProcessing(false)
    }
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

  const teacherNote = book.teacher_note?.trim()
  const recommendedFor = book.recommended_for || []
  const toc = book.toc || []
  const previewImages = book.preview_images || []
  const learnings = book.learnings || []

  const hasAnyContent = teacherNote || recommendedFor.length || toc.length || previewImages.length || learnings.length

  return (
    <div className="max-w-3xl mx-auto">
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

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-primary">
              {book.price === 0 ? '무료' : `${book.price.toLocaleString()}원`}
            </span>
            {isPurchased && book.price > 0 && (
              <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium">
                ✓ 구매 완료
              </span>
            )}
          </div>

          {message && (
            <p className={`text-xs mb-3 ${
              message.type === 'error' ? 'text-red-500'
              : message.type === 'info' ? 'text-amber-600'
              : 'text-emerald-600'
            }`}>
              {message.text}
            </p>
          )}

          <button
            onClick={handleDownload}
            disabled={processing}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {processing ? (
              <><Loader2 size={16} className="animate-spin" /> 처리 중...</>
            ) : isPurchased ? (
              <><Download size={16} /> 다운로드</>
            ) : (
              <><Lock size={16} /> 구매하고 다운받기</>
            )}
          </button>

        </div>
      </div>

      {/* 상세정보 없음 안내 */}
      {!hasAnyContent && (
        <div className="mb-8 p-4 bg-gray-50 border border-border rounded-xl text-center text-sm text-text-secondary">
          이 자료의 상세 정보는 곧 업데이트될 예정이에요.
        </div>
      )}

      {/* 강사의 한마디 */}
      {teacherNote && (
        <Section icon={MessageSquare} title="강사의 한마디" color="primary">
          <p className="text-sm text-text leading-relaxed whitespace-pre-line">{teacherNote}</p>
        </Section>
      )}

      {/* 이런 분께 추천 */}
      {recommendedFor.length > 0 && (
        <Section icon={Target} title="이런 분께 추천해요" color="emerald">
          <ul className="space-y-2">
            {recommendedFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 목차 */}
      {toc.length > 0 && (
        <Section icon={List} title="목차" color="indigo">
          <ol className="space-y-2">
            {toc.map((item, i) => (
              <li key={i} className="text-sm text-text flex gap-3">
                <span className="text-text-secondary shrink-0">{String(i + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* 미리보기 */}
      {previewImages.length > 0 && (
        <Section icon={Eye} title="미리보기" color="rose">
          <div className="grid sm:grid-cols-2 gap-3">
            {previewImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`미리보기 ${i + 1}`}
                className="w-full rounded-lg border border-border"
              />
            ))}
          </div>
        </Section>
      )}

      {/* 이런 걸 배울 수 있어요 */}
      {learnings.length > 0 && (
        <Section icon={Sparkles} title="이런 걸 배울 수 있어요" color="amber">
          <ul className="space-y-2">
            {learnings.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Sparkles size={16} className="text-amber-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 하단 sticky 구매 CTA — 구매 전일 때만 표시 */}
      {!isPurchased && (
        <div className="sticky bottom-4 mt-10 p-4 bg-surface border border-border rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{book.title}</p>
            <p className="text-xs text-text-secondary">
              {book.price === 0 ? '무료' : `${book.price.toLocaleString()}원`}
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={processing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Lock size={14} /> 구매하기
          </button>
        </div>
      )}

      <PaymentMethodSheet
        open={showPaySheet}
        onClose={() => setShowPaySheet(false)}
        onSelect={handlePaymentMethod}
        itemName={book.title}
        itemDesc="E-Book 자료"
        amount={book.price}
      />
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
