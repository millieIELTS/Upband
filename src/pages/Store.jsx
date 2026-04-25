import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Download, Lock, ArrowRight } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Store() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchasedIds, setPurchasedIds] = useState(new Set())
  const [loadingId, setLoadingId] = useState(null)
  const [flashMessage, setFlashMessage] = useState(null) // { id, type, text }

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('ebooks')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          console.error('E-Book fetch error:', err)
          setError(err.message)
        }
        setEbooks(data || [])
        setLoading(false)
      })
  }, [])

  const fetchPurchased = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('ebook_purchases')
      .select('ebook_id')
      .eq('user_id', user.id)
    if (data) setPurchasedIds(new Set(data.map(r => r.ebook_id)))
  }, [user])

  useEffect(() => {
    fetchPurchased()
  }, [fetchPurchased])

  const handleDownload = async (book) => {
    if (!user) {
      navigate('/login')
      return
    }

    // 유료 자료: 결제 시스템 준비 중
    if (book.price > 0 && !purchasedIds.has(book.id)) {
      setFlashMessage({
        id: book.id,
        type: 'info',
        text: '결제 시스템 준비 중이에요. 곧 구매할 수 있도록 추가됩니다.',
      })
      return
    }

    setLoadingId(book.id)
    setFlashMessage(null)

    const { data, error: rpcError } = await supabase.rpc('purchase_ebook', { p_ebook_id: book.id })

    setLoadingId(null)

    if (rpcError || !data?.success) {
      setFlashMessage({ id: book.id, type: 'error', text: '오류가 발생했어요. 다시 시도해 주세요.' })
      return
    }

    setPurchasedIds(prev => new Set([...prev, book.id]))

    // 다운로드 트리거
    const a = document.createElement('a')
    a.href = `${data.file_url}?download=`
    a.click()
  }

  if (loading) return <div className="text-center py-16 text-text-secondary">불러오는 중...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">E-Book 및 자료실</h1>
      <p className="text-text-secondary text-sm mb-8">IELTS 학습에 도움이 되는 전자책을 만나보세요.</p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <p className="font-medium mb-1">데이터를 불러오지 못했습니다.</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {ebooks.length === 0 && !error ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <BookOpen size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary mb-2">아직 등록된 전자책이 없습니다.</p>
          <p className="text-xs text-text-secondary">곧 유용한 학습 자료가 업로드될 예정이에요!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.map((book) => {
            const isPurchased = book.price === 0 || purchasedIds.has(book.id)
            const isLoading = loadingId === book.id
            const flash = flashMessage?.id === book.id ? flashMessage : null

            return (
              <div key={book.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all">
                <Link to={`/store/${book.id}`} className="block no-underline text-text">
                  {book.cover_url ? (
                    <div className="aspect-[3/4] bg-bg overflow-hidden">
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-primary/5 flex items-center justify-center">
                      <BookOpen size={48} className="text-primary/30" />
                    </div>
                  )}
                </Link>
                <div className="p-5">
                  <Link to={`/store/${book.id}`} className="block no-underline text-text mb-1 hover:text-primary transition-colors">
                    <h3 className="text-base font-semibold">{book.title}</h3>
                  </Link>
                  {book.description && (
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">{book.description}</p>
                  )}

                  <Link
                    to={`/store/${book.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary font-medium mb-3 no-underline hover:gap-2 transition-all"
                  >
                    자세히 보기 <ArrowRight size={12} />
                  </Link>


                  {flash && (
                    <p className={`text-xs mb-2 ${
                      flash.type === 'error' ? 'text-red-500'
                      : flash.type === 'info' ? 'text-amber-600'
                      : 'text-emerald-600'
                    }`}>
                      {flash.text}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {book.price === 0 ? '무료' : `${book.price.toLocaleString()}원`}
                    </span>

                    {book.file_url && (
                      <button
                        onClick={() => handleDownload(book)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark"
                      >
                        {isLoading ? (
                          <span className="animate-pulse">처리 중...</span>
                        ) : isPurchased ? (
                          <><Download size={14} /> 다운로드</>
                        ) : (
                          <><Lock size={14} /> 구매하기</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
