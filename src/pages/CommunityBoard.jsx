import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Pin, Pencil, Trash2, MessageCircleQuestion, Star, Lightbulb, Heart, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { parseImageUrls } from './CommunityWrite'

const categoryInfo = {
  qna: { name: 'Q&A', icon: MessageCircleQuestion, color: 'text-primary', bg: 'bg-primary/10' },
  reviews: { name: '후기', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  tips: { name: '공부팁', icon: Lightbulb, color: 'text-emerald-500', bg: 'bg-emerald-50' },
}

export default function CommunityBoard() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { user, isTeacher } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likeCounts, setLikeCounts] = useState({})
  const [likedPosts, setLikedPosts] = useState({})   // 내가 좋아요한 글
  const [commentCounts, setCommentCounts] = useState({})

  const info = categoryInfo[categoryId]

  useEffect(() => {
    fetchPosts()
  }, [categoryId])

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('category', categoryId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data)
      // 좋아요/댓글 수 로드
      const postIds = data.map(p => p.id)
      if (postIds.length > 0) {
        const { data: likes } = await supabase
          .from('community_likes')
          .select('post_id, user_id')
          .in('post_id', postIds)
        const lc = {}
        const myLikes = {}
        likes?.forEach(l => {
          lc[l.post_id] = (lc[l.post_id] || 0) + 1
          if (user && l.user_id === user.id) myLikes[l.post_id] = true
        })
        setLikeCounts(lc)
        setLikedPosts(myLikes)

        const { data: cmts } = await supabase
          .from('community_comments')
          .select('post_id')
          .in('post_id', postIds)
        const cc = {}
        cmts?.forEach(c => { cc[c.post_id] = (cc[c.post_id] || 0) + 1 })
        setCommentCounts(cc)
      }
    }
    setLoading(false)
  }

  const handleDelete = async (postId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('community_posts').delete().eq('id', postId)
    if (error) {
      alert('삭제에 실패했습니다: ' + error.message)
    } else {
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  const handleToggleLike = async (postId) => {
    if (!user) return
    if (likedPosts[postId]) {
      await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      setLikedPosts(prev => ({ ...prev, [postId]: false }))
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 1) - 1 }))
    } else {
      await supabase.from('community_likes').insert({ post_id: postId, user_id: user.id })
      setLikedPosts(prev => ({ ...prev, [postId]: true }))
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
    }
  }

  const handleTogglePin = async (post) => {
    const { error } = await supabase
      .from('community_posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', post.id)
    if (!error) fetchPosts()
  }

  if (!info) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <p className="text-text-secondary">카테고리를 찾을 수 없습니다.</p>
        <Link to="/community" className="text-primary text-sm mt-4 inline-block no-underline">돌아가기</Link>
      </div>
    )
  }

  const Icon = info.icon

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        to="/community"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline"
      >
        <ArrowLeft size={16} /> 커뮤니티
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${info.bg} flex items-center justify-center`}>
            <Icon size={22} className={info.color} />
          </div>
          <h1 className="text-2xl font-bold">{info.name}</h1>
        </div>
        {user && (
          <Link
            to={`/community/${categoryId}/write`}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium no-underline hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} /> 글쓰기
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-secondary text-sm">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary text-sm mb-4">아직 작성된 글이 없어요</p>
          {user && (
            <Link
              to={`/community/${categoryId}/write`}
              className="text-primary text-sm font-medium no-underline hover:underline"
            >
              첫 번째 글을 작성해보세요!
            </Link>
          )}
        </div>
      ) : categoryId === 'reviews' ? (
        /* 후기 — 카드형 레이아웃 */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map(post => (
            <div
              key={post.id}
              className={`bg-surface rounded-2xl border ${post.is_pinned ? 'border-primary/30 bg-primary/5' : 'border-border'} overflow-hidden hover:shadow-lg transition-all cursor-pointer group`}
              onClick={() => navigate(`/community/${categoryId}/${post.id}`)}
            >
              {/* 썸네일 이미지 (첫 번째 이미지 사용) */}
              {post.image_url && parseImageUrls(post.image_url)[0] && (
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={parseImageUrls(post.image_url)[0]}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4">
                {/* 공지 뱃지 */}
                {post.is_pinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-2">
                    <Pin size={10} /> 공지
                  </span>
                )}

                {/* 제목 */}
                <h3 className="font-semibold text-text text-sm mb-1.5 line-clamp-2">{post.title}</h3>

                {/* 본문 미리보기 */}
                <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">
                  {post.content}
                </p>

                {/* 하단: 작성자 + 좋아요/댓글 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="font-medium">{post.author_name}</span>
                    <span>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      disabled={!user}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                        likedPosts[post.id]
                          ? 'bg-red-50 text-red-500'
                          : 'text-text-secondary hover:bg-red-50 hover:text-red-400'
                      } disabled:opacity-40`}
                    >
                      <Heart size={12} className={likedPosts[post.id] ? 'fill-red-500' : ''} />
                      {likeCounts[post.id] > 0 && <span>{likeCounts[post.id]}</span>}
                    </button>
                    {commentCounts[post.id] > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-text-secondary">
                        <MessageSquare size={11} /> {commentCounts[post.id]}
                      </span>
                    )}
                  </div>
                </div>

                {/* 관리 버튼 (이벤트 버블링 차단) */}
                {(isTeacher || user?.id === post.user_id) && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
                    {isTeacher && (
                      <button
                        onClick={() => handleTogglePin(post)}
                        className={`p-1.5 rounded-lg transition-colors ${post.is_pinned ? 'text-primary bg-primary/10' : 'text-text-secondary hover:bg-gray-100'}`}
                        title={post.is_pinned ? '공지 해제' : '공지로 고정'}
                      >
                        <Pin size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/community/${categoryId}/edit/${post.id}`)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
                      title="수정"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Q&A — 기존 목록형 레이아웃 */
        <div className="space-y-3">
          {posts.map(post => (
            <div
              key={post.id}
              className={`bg-surface rounded-xl border ${post.is_pinned ? 'border-primary/30 bg-primary/5' : 'border-border'} p-5 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/community/${categoryId}/${post.id}`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {post.is_pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                        <Pin size={10} /> 공지
                      </span>
                    )}
                    <h3 className="font-semibold text-text text-sm truncate">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                    <span>{post.author_name}</span>
                    <span>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                    {(likeCounts[post.id] > 0 || commentCounts[post.id] > 0) && (
                      <>
                        <span>·</span>
                        {likeCounts[post.id] > 0 && (
                          <span className="flex items-center gap-0.5"><Heart size={11} className="text-red-400" /> {likeCounts[post.id]}</span>
                        )}
                        {commentCounts[post.id] > 0 && (
                          <span className="flex items-center gap-0.5"><MessageSquare size={11} /> {commentCounts[post.id]}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 수정/삭제 (본인 또는 선생님) */}
                {(isTeacher || user?.id === post.user_id) && (
                  <div className="flex items-center gap-1 shrink-0">
                    {isTeacher && (
                      <button
                        onClick={() => handleTogglePin(post)}
                        className={`p-1.5 rounded-lg transition-colors ${post.is_pinned ? 'text-primary bg-primary/10' : 'text-text-secondary hover:bg-gray-100'}`}
                        title={post.is_pinned ? '공지 해제' : '공지로 고정'}
                      >
                        <Pin size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/community/${categoryId}/edit/${post.id}`)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
                      title="수정"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
