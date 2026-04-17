import { useState, useEffect } from 'react'
import { BookOpen, Download, Coins } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Store() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)

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

  if (loading) return <div className="text-center py-16 text-text-secondary">불러오는 중...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">E-Book Store</h1>
      <p className="text-text-secondary text-sm mb-8">IELTS 학습에 도움이 되는 전자책을 만나보세요.</p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <p className="font-medium mb-1">데이터를 불러오지 못했습니다.</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {ebooks.length === 0 && !error ? (
        /* 전자책 없음 */
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <BookOpen size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary mb-2">아직 등록된 전자책이 없습니다.</p>
          <p className="text-xs text-text-secondary">곧 유용한 학습 자료가 업로드될 예정이에요!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.map((book) => (
            <div key={book.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all">
              {book.cover_url && (
                <div className="aspect-[3/4] bg-bg overflow-hidden">
                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                </div>
              )}
              {!book.cover_url && (
                <div className="aspect-[3/4] bg-primary/5 flex items-center justify-center">
                  <BookOpen size={48} className="text-primary/30" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-base font-semibold mb-1">{book.title}</h3>
                {book.description && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{book.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-lg font-bold text-primary">
                    {book.price === 0 ? '무료' : (
                      <>
                        <Coins size={18} className="text-accent" />
                        {book.price.toLocaleString()}
                      </>
                    )}
                  </span>
                  {book.file_url && (
                    <a
                      href={`${book.file_url}?download=`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors no-underline"
                    >
                      <Download size={14} />
                      {book.price === 0 ? '다운로드' : '구매하기'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
