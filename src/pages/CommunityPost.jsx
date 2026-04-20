import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pin, Pencil, Trash2, Send, Loader2, MessageSquare, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { parseImageUrls } from './CommunityWrite'

const categoryNames = { qna: 'Q&A', reviews: '후기', tips: '공부팁' }

export default function CommunityPost() {
  const { categoryId, postId } = useParams()
  const navigate = useNavigate()
  const { user, profile, isTeacher } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  // 댓글 state
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  // 좋아요 state
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    loadPost()
    loadComments()
    loadLikes()
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

  const loadComments = async () => {
    const { data } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    setComments(data || [])
  }

  const loadLikes = async () => {
    // 총 좋아요 수
    const { count } = await supabase
      .from('community_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    setLikeCount(count || 0)

    // 내가 좋아요 했는지
    if (user) {
      const { data } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()
      setLiked(Boolean(data))
    }
  }

  const handleToggleLike = async () => {
    if (!user || likeLoading) return
    setLikeLoading(true)

    if (liked) {
      await supabase
        .from('community_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      setLiked(false)
      setLikeCount(c => c - 1)
    } else {
      await supabase
        .from('community_likes')
        .insert({ post_id: postId, user_id: user.id })
      setLiked(true)
      setLikeCount(c => c + 1)
    }
    setLikeLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('community_posts').delete().eq('id', postId)
    if (error) {
      alert('삭제에 실패했습니다: ' + error.message)
    } else {
      navigate(`/community/${categoryId}`)
    }
  }

  const handleTogglePin = async () => {
    const { error } = await supabase
      .from('community_posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', postId)
    if (!error) setPost({ ...post, is_pinned: !post.is_pinned })
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return

    setCommentLoading(true)
    const { error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: commentText.trim(),
        author_name: profile?.display_name || '익명',
      })

    if (!error) {
      setCommentText('')
      loadComments()
    }
    setCommentLoading(false)
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    await supabase.from('community_comments').delete().eq('id', commentId)
    setComments(comments.filter(c => c.id !== commentId))
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
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 mb-4">
          {post.image_url && (() => {
            const urls = parseImageUrls(post.image_url)
            if (urls.length === 0) return null
            return (
              <div className="mb-4 flex flex-col gap-3">
                {urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`첨부 이미지 ${i + 1}`}
                    className="rounded-xl border border-border max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )
          })()}
          <div className="text-sm text-text leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* 좋아요 + 댓글 수 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleToggleLike}
            disabled={!user || likeLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              liked
                ? 'bg-red-50 text-red-500 border border-red-200'
                : 'bg-gray-50 text-text-secondary border border-border hover:bg-red-50 hover:text-red-400'
            } disabled:opacity-50`}
          >
            <Heart size={16} className={liked ? 'fill-red-500' : ''} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-text-secondary">
            <MessageSquare size={16} /> {comments.length}
          </span>
        </div>

        {/* 액션 버튼 */}
        {canEdit && (
          <div className="flex items-center gap-2 mb-8">
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

      {/* 댓글 섹션 */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={18} className="text-text-secondary" />
          <h3 className="font-semibold text-sm">댓글 {comments.length > 0 && `(${comments.length})`}</h3>
        </div>

        {/* 댓글 목록 */}
        {comments.length > 0 && (
          <div className="space-y-3 mb-6">
            {comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="font-medium text-text">{comment.author_name}</span>
                    <span>·</span>
                    <span>{new Date(comment.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {(isTeacher || user?.id === comment.user_id) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 rounded text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* 댓글 입력 */}
        {user ? (
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={commentLoading || !commentText.trim()}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-primary-dark transition-colors"
            >
              {commentLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        ) : (
          <p className="text-xs text-text-secondary text-center">
            댓글을 작성하려면 <Link to="/login" className="text-primary no-underline">로그인</Link>해주세요.
          </p>
        )}
      </div>
    </div>
  )
}
