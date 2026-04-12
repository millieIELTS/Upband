import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const categoryNames = { qna: 'Q&A', reviews: '후기' }

export default function CommunityWrite() {
  const { categoryId, postId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const isEdit = Boolean(postId)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadPost()
    }
  }, [postId])

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error || !data) {
      setError('글을 찾을 수 없습니다.')
    } else {
      setTitle(data.title)
      setContent(data.content)
    }
    setLoadingPost(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('community_posts')
          .update({ title: title.trim(), content: content.trim(), updated_at: new Date().toISOString() })
          .eq('id', postId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('community_posts')
          .insert({
            user_id: user.id,
            category: categoryId,
            title: title.trim(),
            content: content.trim(),
            author_name: profile?.display_name || '익명',
          })
        if (error) throw error
      }
      navigate(`/community/${categoryId}`)
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (loadingPost) {
    return <div className="max-w-2xl mx-auto py-20 text-center text-text-secondary text-sm">불러오는 중...</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        to={`/community/${categoryId}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline"
      >
        <ArrowLeft size={16} /> {categoryNames[categoryId] || '목록'}으로
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? '글 수정' : '글쓰기'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            className="w-full h-64 px-4 py-3 rounded-xl border border-border bg-surface resize-y text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
