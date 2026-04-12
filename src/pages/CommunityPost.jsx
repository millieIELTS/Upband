import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pin, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const categoryNames = { qna: 'Q&A', reviews: '후기' }

export default function CommunityPost() {
  const { categoryId, postId } = useParams()
  const navigate = useNavigate()
  const { user, isTeacher } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPost()
  }, [postId])

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (!error) setPost(data)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('community_posts').delete().eq('id', postId)
    navigate(`/community/${categoryId}`)
  }

  const handleTogglePin = async () => {
    const { error } = await supabase
      .from('community_posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', postId)
    if (!error) setPost({ ...post, is_pinned: !post.is_pinned })
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto py-20 text-center text-text-secondary text-sm">불러오는 중...</div>
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <p className="text-text-secondary mb-4">글을 찾을 수 없습니다.</p>
        <Link to={`/community/${categoryId}`} className="text-primary text-sm no-underline">목록으로</Link>
      </div>
    )
  }

  const canEdit = isTeacher || user?.id === post.user_id

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        to={`/community/${categoryId}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline"
      >
        <ArrowLeft size={16} /> {categoryNames[categoryId] || '목록'}
      </Link>

      <article>
        {/* 헤더 */}
        <div className="mb-6">
          {post.is_pinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-2">
              <Pin size={10} /> 공지
            </span>
          )}
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="font-medium text-text">{post.author_name}</span>
            <span>·</span>
            <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {post.updated_at !== post.created_at && <span className="text-xs">(수정됨)</span>}
          </div>
        </div>

        {/* 본문 */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 mb-6">
          <div className="text-sm text-text leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* 액션 버튼 */}
        {canEdit && (
          <div className="flex items-center gap-2">
            {isTeacher && (
              <button
                onClick={handleTogglePin}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  post.is_pinned
                    ? 'bg-primary/10 text-primary'
                    : 'border border-border text-text-secondary hover:bg-gray-50'
                }`}
              >
                <Pin size={13} /> {post.is_pinned ? '공지 해제' : '공지로 고정'}
              </button>
            )}
            <Link
              to={`/community/${categoryId}/edit/${post.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-secondary no-underline hover:bg-gray-50 transition-colors"
            >
              <Pencil size={13} /> 수정
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} /> 삭제
            </button>
          </div>
        )}
      </article>
    </div>
  )
}
